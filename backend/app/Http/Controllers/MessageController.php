<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;

use App\Events\MessageSent;
class MessageController extends Controller
{
public function sendMessage(Request $request)
{
    $validated = $request->validate([
        "sender_id"   => "required",
        "receiver_id" => "required",
        "message"     => "nullable|string",
        "image"       => "nullable|image|max:2048",
    ]);

    if ($request->hasFile("image")) {
        $validated["image"] = $request->file("image")
            ->store("images", "public");
    }

    if (!$request->message && !$request->hasFile('image')) {
        return response()->json([
            "error" => "Message or image required"
        ], 422);
    }

    $message = Message::create($validated);
    $message->load('sender.profile');

    broadcast(new MessageSent($message))->toOthers();
    event(new \App\Events\MessageNotificationSentEvent($message));

    return response()->json($message);
}



    public function getMessages($userId)
    {
       $messages = Message::where('sender_id', auth()->id())
            ->where('receiver_id', $userId)
            ->orWhere(function ($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->where('receiver_id', auth()->id());
            })
            ->orderBy('created_at', 'asc')
            ->get();
            $messages->load('sender','receiver');

        return response()->json($messages);
    }

    public function editMessage(Request $request, $messageId)
    {
        $validated = $request->validate([
            "message" => "required"
        ]);


        $message = Message::findOrFail($messageId);
        $message->message = $validated['message'];
        $message->is_edited = true;
        $message->save();

        broadcast(new \App\Events\MessageEdited($message));

        return response()->json($message);
    }

    public function deleteMessage($messageId)
    {
        $message = Message::findOrFail($messageId);
         if ($message->sender_id !== auth()->id()) {
        return response()->json(['error' => 'Unauthorized'], 403);
        }
        $message->delete();

        broadcast(new \App\Events\MessageDeleted($messageId));

        return response()->json(['message' => 'Message deleted successfully.']);
    }

    public function markAsRead(Request $request)
    {
        $validated = $request->validate([
            "sender_id" => "required"
        ]);
        $viewer_id = auth()->id();
        $senderId = $validated['sender_id'];
        $message = Message::where('sender_id', $senderId)
            ->where('receiver_id', $viewer_id)
            ->where('markAsRead', false)
            ->first();
        if (!$message) {
            return response()->json(['message' => 'No unread messages found.']);
        }
        Message::where('sender_id', $senderId)
            ->where('receiver_id', $viewer_id)
            ->where('markAsRead', false)
            ->update(['markAsRead' => true]);
            broadcast(new \App\Events\MessageSeenEvent($senderId, $viewer_id, $message))->toOthers();

        return response()->json(['message' => 'Messages marked as read.']);
    }
}

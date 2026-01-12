<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSeenEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $senderId;
    public $viewer_id;
    public $message;
    public function __construct($senderId, $viewer_id, $message)
    {
        $this->senderId = $senderId;
        $this->viewer_id = $viewer_id;
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn()
    {
        return new PrivateChannel('message.seen.' . $this->senderId);
    }
    public function broadcastWith()
{
    return [
        'message' => [
            'id' => $this->message->id,
            'message' => $this->message->message,
            'sender_id' => $this->message->sender_id,
            'viewer_id' => $this->message->receiver_id,
            'markAsRead' => $this->message->markAsRead ?? 0,
            'created_at' => $this->message->created_at,
            'sender' => $this->message->sender,
        ]
    ];
}

}

<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */

    public $sender_id;
    public $receiver_id;
    public $receiver_name;
    public $is_typing;
        public function __construct($sender_id, $receiver_id, $receiver_name ,$is_typing)

    {
         \Log::info("UserTyping Fired", [
        'sender' => $sender_id,
        'receiver' => $receiver_id
    ]);
        $this->sender_id = $sender_id;
        $this->receiver_id = $receiver_id;
        $this->receiver_name = $receiver_name;
        $this->is_typing = $is_typing;
    }


    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn()
    {
  return new PrivateChannel('typing.' . $this->receiver_id);
        
    }


    public function broadcasAs()

    {
        return "UserTyping";
    }
}

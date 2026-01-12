<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        "sender_id",
        "receiver_id",
        "message",
        "is_edited",
        "image"
    ];

    // Sender user
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Receiver user
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}

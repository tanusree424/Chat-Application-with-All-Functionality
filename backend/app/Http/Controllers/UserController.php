<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function allUsers()
    {
        $users = User::where("id" , "!=" , auth()->id())->with('profile')->get();
        return response()->json($users);
    }
public function me()
{
    $user = auth()->user()->load('profile');

    return response()->json([
        'success' => true,
        'status' => 200,
        'user' => $user
    ]);
}


   public function updateProfile(Request $request)
{
    $user = auth()->user();
    $profile = $user->profile;

    $data = [
        'bio' => $request->bio,
        "name" => $request->name
    ];
    

    // ✅ Avatar upload
    if ($request->hasFile('avatar')) {
        $data['avatar'] = $request->file('avatar')
            ->store('avatars', 'public');
    }

    // ✅ Cover photo upload
    if ($request->hasFile('cover_photo')) {
        $data['cover_photo'] = $request->file('cover_photo')->store('covers', 'public');
    }


    if ($profile) {
         $user->name = $data['name'] ?? $user->name;
        $user->save();
        $profile->update($data);
    } else {
        $data['user_id'] = $user->id;
        $user->name = $data['name'] ?? $user->name;
        $user->save();
        $profile = \App\Models\Profile::create($data);
    }

    return response()->json($user->load('profile'));
}

public function searchUsers(Request $request)
{
    $searchTerm = trim($request->q);

    if (strlen($searchTerm) < 2) {
        return response()->json([]);
    }

    $authId = auth()->id();

    $query = User::query();

    if ($authId) {
        $query->where('id', '!=', $authId);
    }

    $users = $query
        ->where(function ($q) use ($searchTerm) {
            $q->where('name', 'LIKE', "%{$searchTerm}%")
              ->orWhere('email', 'LIKE', "%{$searchTerm}%");
        })
        ->select('id', 'name', 'email')
        ->limit(10)
        ->get();

    return response()->json($users);
}
    

}        
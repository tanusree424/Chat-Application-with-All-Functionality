<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Events\UserOnlineEvent;
use Carbon\Carbon;
class AuthController extends Controller
{
    
   public function register(Request $request)
   {
       $validated= $request->validate([
            "name" => "required",
            "email"=>"required|email|unique:users,email",
            "password"=>"required|min:3"
        ]);
        $user = User::create([
            "name"=>$validated["name"],
            "email"=>$validated["email"],
            "password"=> \Hash::make($validated["password"])
        ]);

        return response()->json([
            "status"=>201,
            "success"=>true,
            "message"=>"User created successfully",
            "user"=>$user
        ]);
   }
 public function signin(Request $request)
 {
      $validated= $request->validate([
            "email"=>"required|email",
            "password"=>"required|min:3"
        ]);

        $user = User::where("email", $validated["email"])->first();

        if (!$user || !\Hash::check($validated["password"], $user->password )) {
         //   \Log::info("user");
           return response()->json(["status"=>400, "success"=>false ,"message"=>"Invalid Credentials" ]);
        }
        $token =  $user->createToken("auth_token")->plainTextToken;
        $user->update([
            "is_online"=>true,
            "last_seen"=>now()
        ]);
        
        // $lastSeenKolkata = $user->last_seen ? $user->last_seen->setTimezone('Asia/Kolkata')->format('Y-m-d H:i:s') : null;
        broadcast(new UserOnlineEvent($user));
         return response()->json(["status"=>200, "success"=>true ,"message"=>"LoggedIn Successfully", "user"=>$user ,"token"=>$token ]);
 }

 public function logout(Request $request)
{
    try {
        $user = $request->user(); // 🔴 এখানেই null হলে 500 হয়

        $user->update([
            'is_online' => false,
            'last_seen' => Carbon::now('Asia/Kolkata'),
        ]);

        $user->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}

 

  
}

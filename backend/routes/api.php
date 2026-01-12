<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UserController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::post("/signup",[AuthController::class,'register']);
Route::post('/login', [AuthController::class, 'signin']); 

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();

// });
Route::middleware('auth:sanctum')->group(function()
{
Route::get('/me',[UserController::class,'me']);
Route::post('/update-profile',[UserController::class,'updateProfile']);
Route::post("/send-message",[MessageController::class,'sendMessage']);
Route::get("/messages/{userId}",[MessageController::class,'getMessages']);
Route::put("/edit-message/{messageId}",[MessageController::class,'editMessage']);
Route::delete("/delete-message/{messageId}",[MessageController::class,'deleteMessage']);
Route::get('/logout', [AuthController::class, 'logout']); 
Route::get("/users",[UserController::class,"allUsers"]);
Route::get("/search-users",[UserController::class,"searchUsers"]);
Route::post("/mark-messages-seen",[MessageController::class,"markAsRead"]);
Route::post("/typing", function(Request $request){
     \Log::info("Typing API hit", [
        'from' => auth()->id(),
        'to' => $request->receiver_id
    ]);

    broadcast(new App\Events\UserTyping(
        auth()->id(),
        $request->receiver_id,
        auth()->user()->name,
        $request->is_typing
        )
    )->toOthers();;
   
});
 return response()->json(['ok'=>true]);
}
    
);
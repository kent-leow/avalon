/**
 * Utility function to extend room expiration
 * Extends room expiration by 2 hours from current time
 */
export async function extendRoomExpiration(db: any, roomId: string) {
  const extensionTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
  
  await db.room.update({
    where: { id: roomId },
    data: { 
      expiresAt: extensionTime,
      updatedAt: new Date()
    }
  });
}

/**
 * Middleware to extend room expiration on any room activity
 */
export async function extendRoomOnActivity(db: any, roomId: string) {
  try {
    await extendRoomExpiration(db, roomId);
  } catch (error) {
    console.warn('Failed to extend room expiration:', error);
  }
}

/**
 * Check if room has expired and handle cleanup
 */
export async function validateRoomExpiration(db: any, roomId: string) {
  const room = await db.room.findUnique({
    where: { id: roomId },
    select: { expiresAt: true, code: true }
  });

  if (!room) {
    throw new Error("Room not found");
  }

  const now = new Date();
  if (now > room.expiresAt) {
    // Room has expired, delete it
    await db.room.delete({
      where: { id: roomId }
    });
    throw new Error("Room has expired and has been removed");
  }

  return room;
}

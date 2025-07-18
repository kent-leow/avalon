/**
 * Socket.IO Server Configuration
 * Real-time communication server for Avalon game
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { db } from './db';
import { createRealTimeEvent, validateEventPayload } from '~/lib/real-time-sync-utils';
import type { RealTimeEvent, PlayerActivity } from '~/types/real-time-sync';

export interface SocketUser {
  playerId: string;
  playerName: string;
  roomCode: string;
  socketId: string;
  joinedAt: Date;
  lastActivity: Date;
}

class SocketManager {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, SocketUser>();
  private roomConnections = new Map<string, Set<string>>();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`[Socket] New connection: ${socket.id}`);

      // Handle room joining
      socket.on('join_room', async (data: {
        roomCode: string;
        playerId: string;
        playerName: string;
        timestamp: Date;
      }) => {
        try {
          await this.handleJoinRoom(socket, data);
        } catch (error) {
          console.error('[Socket] Join room error:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Handle real-time events
      socket.on('realtime_event', async (event: RealTimeEvent) => {
        try {
          await this.handleRealtimeEvent(socket, event);
        } catch (error) {
          console.error('[Socket] Realtime event error:', error);
          socket.emit('error', { message: 'Failed to process event' });
        }
      });

      // Handle player activity updates
      socket.on('player_activity', async (activity: Omit<PlayerActivity, 'timestamp'>) => {
        try {
          await this.handlePlayerActivity(socket, activity);
        } catch (error) {
          console.error('[Socket] Player activity error:', error);
        }
      });

      // Handle ping for latency measurement
      socket.on('ping', (callback) => {
        if (typeof callback === 'function') {
          callback();
        }
      });

      // Handle disconnection
      socket.on('disconnect', async (reason) => {
        await this.handleDisconnect(socket, reason);
      });

      // Handle leave room
      socket.on('leave_room', async () => {
        await this.handleLeaveRoom(socket);
      });
    });
  }

  private async handleJoinRoom(
    socket: any,
    data: { roomCode: string; playerId: string; playerName: string; timestamp: Date }
  ) {
    const { roomCode, playerId, playerName } = data;

    // Verify room exists and user is in room
    const room = await db.room.findUnique({
      where: { code: roomCode },
      include: { players: true },
    });

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const player = room.players.find((p: any) => p.id === playerId);
    if (!player) {
      socket.emit('error', { message: 'Player not found in room' });
      return;
    }

    // Remove any existing connection for this player
    const existingUser = Array.from(this.connectedUsers.values())
      .find(user => user.playerId === playerId && user.roomCode === roomCode);
    
    if (existingUser) {
      this.removeUserConnection(existingUser.socketId);
    }

    // Create user connection
    const user: SocketUser = {
      playerId,
      playerName,
      roomCode,
      socketId: socket.id,
      joinedAt: new Date(),
      lastActivity: new Date(),
    };

    this.connectedUsers.set(socket.id, user);

    // Add to room
    if (!this.roomConnections.has(roomCode)) {
      this.roomConnections.set(roomCode, new Set());
    }
    this.roomConnections.get(roomCode)!.add(socket.id);

    socket.join(roomCode);

    console.log(`[Socket] Player ${playerName} joined room ${roomCode}`);

    // Notify room about player joining
    const joinEvent = createRealTimeEvent(
      'player_joined',
      { 
        playerId, 
        playerName,
        timestamp: new Date(),
      },
      playerId,
      roomCode
    );

    socket.to(roomCode).emit('realtime_event', joinEvent);

    // Send current room state to new player
    await this.sendRoomStateToPlayer(socket, roomCode, playerId);

    // Update player online status
    await this.updatePlayerOnlineStatus(playerId, true);
  }

  private async handleRealtimeEvent(socket: any, event: RealTimeEvent) {
    const user = this.connectedUsers.get(socket.id);
    if (!user) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Validate event
    if (!validateEventPayload(event)) {
      socket.emit('error', { message: 'Invalid event payload' });
      return;
    }

    // Update last activity
    user.lastActivity = new Date();

    // Process event based on type
    switch (event.type) {
      case 'vote_cast':
        await this.handleVoteEvent(user.roomCode, event);
        break;
      case 'mission_team_selected':
        await this.handleTeamSelectionEvent(user.roomCode, event);
        break;
      case 'game_phase_changed':
        await this.handleGamePhaseEvent(user.roomCode, event);
        break;
      case 'player_ready_status':
        await this.handlePlayerReadyEvent(user.roomCode, event);
        break;
      default:
        // Broadcast generic events to room
        socket.to(user.roomCode).emit('realtime_event', event);
    }
  }

  private async handlePlayerActivity(
    socket: any,
    activity: Omit<PlayerActivity, 'timestamp'>
  ) {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    const activityEvent: PlayerActivity = {
      ...activity,
      timestamp: new Date(),
    };

    user.lastActivity = new Date();

    // Broadcast activity to room (except sender)
    socket.to(user.roomCode).emit('player_activity', activityEvent);
  }

  private async handleVoteEvent(roomCode: string, event: RealTimeEvent) {
    // Update database with vote
    // This would typically be handled by the existing TRPC endpoints
    // but we can emit real-time updates immediately
    
    this.io.to(roomCode).emit('realtime_event', {
      ...event,
      timestamp: new Date(),
    });

    // If all players have voted, trigger results
    // This would be determined by checking the database
    // For now, we'll emit a generic update
    const progressEvent = createRealTimeEvent(
      'voting_progress_updated',
      {
        votesReceived: event.payload.votesReceived,
        totalPlayers: event.payload.totalPlayers,
        isComplete: event.payload.isComplete,
      },
      event.playerId,
      roomCode
    );

    this.io.to(roomCode).emit('realtime_event', progressEvent);
  }

  private async handleTeamSelectionEvent(roomCode: string, event: RealTimeEvent) {
    this.io.to(roomCode).emit('realtime_event', {
      ...event,
      timestamp: new Date(),
    });
  }

  private async handleGamePhaseEvent(roomCode: string, event: RealTimeEvent) {
    this.io.to(roomCode).emit('realtime_event', {
      ...event,
      timestamp: new Date(),
    });
  }

  private async handlePlayerReadyEvent(roomCode: string, event: RealTimeEvent) {
    this.io.to(roomCode).emit('realtime_event', {
      ...event,
      timestamp: new Date(),
    });

    // Check if all players are ready and emit start game event if needed
    // This would involve checking the database
  }

  private async handleDisconnect(socket: any, reason: string) {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    console.log(`[Socket] Player ${user.playerName} disconnected from room ${user.roomCode}: ${reason}`);

    // Remove user from connections
    this.removeUserConnection(socket.id);

    // Update player online status
    await this.updatePlayerOnlineStatus(user.playerId, false);

    // Notify room about player leaving
    const leaveEvent = createRealTimeEvent(
      'player_left',
      { 
        playerId: user.playerId, 
        playerName: user.playerName,
        reason,
        timestamp: new Date(),
      },
      user.playerId,
      user.roomCode
    );

    socket.to(user.roomCode).emit('realtime_event', leaveEvent);
  }

  private async handleLeaveRoom(socket: any) {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    console.log(`[Socket] Player ${user.playerName} left room ${user.roomCode}`);

    this.removeUserConnection(socket.id);
    await this.updatePlayerOnlineStatus(user.playerId, false);

    const leaveEvent = createRealTimeEvent(
      'player_left',
      { 
        playerId: user.playerId, 
        playerName: user.playerName,
        timestamp: new Date(),
      },
      user.playerId,
      user.roomCode
    );

    socket.to(user.roomCode).emit('realtime_event', leaveEvent);
  }

  private removeUserConnection(socketId: string) {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      this.connectedUsers.delete(socketId);
      
      const roomSockets = this.roomConnections.get(user.roomCode);
      if (roomSockets) {
        roomSockets.delete(socketId);
        if (roomSockets.size === 0) {
          this.roomConnections.delete(user.roomCode);
        }
      }
    }
  }

  private async sendRoomStateToPlayer(socket: any, roomCode: string, playerId: string) {
    try {
      const room = await db.room.findUnique({
        where: { code: roomCode },
        include: { 
          players: true,
        },
      });

      if (!room) return;

      const stateEvent = createRealTimeEvent(
        'room_state_sync',
        {
          room: {
            id: room.id,
            roomCode: room.code,
            phase: room.phase,
            players: room.players.map((p: any) => ({
              id: p.id,
              name: p.name,
              isHost: p.isHost,
              isReady: p.isReady,
              isOnline: this.isPlayerOnline(p.id, roomCode),
            })),
            settings: room.settings,
            gameState: room.gameState,
          },
          timestamp: new Date(),
        },
        playerId,
        roomCode
      );

      socket.emit('realtime_event', stateEvent);
    } catch (error) {
      console.error('[Socket] Error sending room state:', error);
    }
  }

  private async updatePlayerOnlineStatus(playerId: string, isOnline: boolean) {
    try {
      // You could update a Redis cache or database here
      // For now, we'll just track it in memory
      console.log(`[Socket] Player ${playerId} online status: ${isOnline}`);
    } catch (error) {
      console.error('[Socket] Error updating player online status:', error);
    }
  }

  private isPlayerOnline(playerId: string, roomCode: string): boolean {
    return Array.from(this.connectedUsers.values())
      .some(user => user.playerId === playerId && user.roomCode === roomCode);
  }

  // Public methods for external use
  public emitToRoom(roomCode: string, event: RealTimeEvent) {
    this.io.to(roomCode).emit('realtime_event', event);
  }

  public emitToPlayer(playerId: string, roomCode: string, event: RealTimeEvent) {
    const user = Array.from(this.connectedUsers.values())
      .find(u => u.playerId === playerId && u.roomCode === roomCode);
    
    if (user) {
      this.io.to(user.socketId).emit('realtime_event', event);
    }
  }

  public getRoomConnections(roomCode: string): SocketUser[] {
    const roomSockets = this.roomConnections.get(roomCode);
    if (!roomSockets) return [];

    return Array.from(roomSockets)
      .map(socketId => this.connectedUsers.get(socketId))
      .filter(Boolean) as SocketUser[];
  }

  public getOnlinePlayersInRoom(roomCode: string): string[] {
    return this.getRoomConnections(roomCode).map(user => user.playerId);
  }
}

let socketManager: SocketManager | null = null;

export function initializeSocket(server: HTTPServer): SocketManager {
  if (!socketManager) {
    socketManager = new SocketManager(server);
    console.log('[Socket] Socket.IO server initialized');
  }
  return socketManager;
}

export function getSocketManager(): SocketManager | null {
  return socketManager;
}

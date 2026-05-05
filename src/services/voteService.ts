import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  getDoc, 
  serverTimestamp,
  getFirestore,
  initializeFirestore
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const submitPathfinderVote = async (vote: 'up' | 'down', userId?: string) => {
  const voteId = userId ? `v_${userId}` : `v_${Math.random().toString(36).substring(2, 15)}`;
  const votePath = `pathfinder_votes/${voteId}`;
  const statsPath = 'stats/pathfinder';

  try {
    // 1. Record the individual vote
    await setDoc(doc(db, 'pathfinder_votes', voteId), {
      vote,
      timestamp: serverTimestamp(),
      userId: userId || 'anonymous'
    });

    // 2. Increment the global counter
    const statsRef = doc(db, 'stats', 'pathfinder');
    const statsSnap = await getDoc(statsRef);

    if (!statsSnap.exists()) {
      await setDoc(statsRef, {
        upVotes: vote === 'up' ? 1 : 0,
        downVotes: vote === 'down' ? 1 : 0,
        totalVotes: 1
      });
    } else {
      await updateDoc(statsRef, {
        upVotes: vote === 'up' ? increment(1) : increment(0),
        downVotes: vote === 'down' ? increment(1) : increment(0),
        totalVotes: increment(1)
      });
    }
    
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, votePath);
    return false;
  }
};

export const getPathfinderStats = async () => {
  const statsPath = 'stats/pathfinder';
  try {
    const statsRef = doc(db, 'stats', 'pathfinder');
    const statsSnap = await getDoc(statsRef);
    if (statsSnap.exists()) {
      return statsSnap.data();
    }
    return { upVotes: 0, downVotes: 0, totalVotes: 0 };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, statsPath);
    return { upVotes: 0, downVotes: 0, totalVotes: 0 };
  }
};

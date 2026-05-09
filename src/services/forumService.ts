import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  updateDoc, 
  doc, 
  increment,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ForumPost {
  id?: string;
  firstName?: string;
  lastName?: string;
  isAnonymous: boolean;
  photoUrl?: string;
  content: string;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  sharedImage?: string;
  heroTicketId?: string;
  likes: number;
  hearts: number;
  rating: number; // 1-5
  createdAt: any;
}

const COLLECTION_NAME = 'forum_posts';

export const subscribeToPosts = (callback: (posts: ForumPost[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ForumPost[];
    callback(posts);
  }, (error) => {
    console.error("Forum subscription error:", error);
  });
};

export const createPost = async (post: Omit<ForumPost, 'id' | 'likes' | 'hearts' | 'createdAt'>) => {
  try {
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...post,
      likes: 0,
      hearts: 0,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const updateEngagement = async (postId: string, type: 'likes' | 'hearts') => {
  const postRef = doc(db, COLLECTION_NAME, postId);
  try {
    await updateDoc(postRef, {
      [type]: increment(1)
    });
  } catch (error) {
    console.error("Error updating engagement:", error);
  }
};

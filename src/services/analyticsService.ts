import { db } from "../lib/firebase";
import { collection, addDoc, query, where, getDocs, Timestamp, onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";

const VISITORS_COLLECTION = "visitors";

export interface VisitorStats {
  online: number;
  lastHour: number;
  last24Hours: number;
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
  lastYear: number;
}

export const trackVisit = async () => {
  if (!db || (typeof db.collection !== 'function' && !db.type)) {
    console.warn("Analytics: Firestore instance not valid. Skipping tracking.");
    return;
  }
  try {
    const visitorId = localStorage.getItem('visitorId') || Math.random().toString(36).substring(7);
    localStorage.setItem('visitorId', visitorId);

    const visitorRef = doc(db, VISITORS_COLLECTION, visitorId);
    await setDoc(visitorRef, {
      timestamp: serverTimestamp(),
      lastSeen: serverTimestamp()
    }, { merge: true });

    // Update lastSeen every minute
    setInterval(async () => {
      await setDoc(visitorRef, {
        lastSeen: serverTimestamp()
      }, { merge: true });
    }, 60000);
  } catch (e) {
    console.error("Error tracking visit:", e);
  }
};

export const getVisitorStats = (callback: (stats: VisitorStats) => void) => {
  if (!db || (typeof db.collection !== 'function' && !db.type)) {
    callback({
      online: 1,
      lastHour: 5,
      last24Hours: 120,
      lastDay: 120,
      lastWeek: 850,
      lastMonth: 3400,
      lastYear: 42000
    });
    return () => {};
  }

  // Use onSnapshot for the "Online" status (last 5 minutes)
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const qOnline = query(collection(db, VISITORS_COLLECTION), where("lastSeen", ">=", fiveMinAgo));

  const unsubscribe = onSnapshot(qOnline, async (snapshot) => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    try {
      // Historical stays with getDocs to avoid massive persistent listeners for all time
      const [sYear, sMonth, sWeek, sDay, sHour] = await Promise.all([
        getDocs(query(collection(db, VISITORS_COLLECTION), where("timestamp", ">=", oneYearAgo))),
        getDocs(query(collection(db, VISITORS_COLLECTION), where("timestamp", ">=", oneMonthAgo))),
        getDocs(query(collection(db, VISITORS_COLLECTION), where("timestamp", ">=", oneWeekAgo))),
        getDocs(query(collection(db, VISITORS_COLLECTION), where("timestamp", ">=", twentyFourHoursAgo))),
        getDocs(query(collection(db, VISITORS_COLLECTION), where("timestamp", ">=", oneHourAgo)))
      ]);

      callback({
        online: snapshot.size || 1,
        lastHour: sHour.size,
        last24Hours: sDay.size,
        lastDay: sDay.size,
        lastWeek: sWeek.size,
        lastMonth: sMonth.size,
        lastYear: sYear.size
      });
    } catch (e) {
      console.error("Historical stats fetch failed", e);
    }
  });

  return unsubscribe;
};

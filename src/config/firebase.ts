import {
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';

import {
  GoogleAuthProvider,
  User,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import {
  getFirestore,
} from 'firebase/firestore';

import {
  getStorage,
} from 'firebase/storage';

import firebaseConfig from '../../firebase-applet-config.json';

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        apiKey: firebaseConfig.apiKey,
        authDomain:
          firebaseConfig.authDomain,
        projectId:
          firebaseConfig.projectId,
        storageBucket:
          firebaseConfig.storageBucket,
        messagingSenderId:
          firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId,
      });

export const db =
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId.trim() !==
    ''
    ? getFirestore(
        app,
        firebaseConfig.firestoreDatabaseId
      )
    : getFirestore(app);

export const auth = getAuth(app);

export const storage =
  getStorage(
    app
  );

const googleProvider =
  new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Khách tạo gift vẫn dùng Anonymous Auth như cũ.
 * Nếu đang đăng nhập Google thì giữ nguyên user đó,
 * không tự chuyển về anonymous.
 */
export const ensureAuth = async () => {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.warn(
        'Anonymous auth note:',
        error
      );
    }
  }

  return auth.currentUser;
};

/**
 * Chờ Firebase Auth khôi phục session hiện tại.
 * Admin không được tự tạo anonymous user ở bước này.
 */
export const waitForAuthReady =
  (): Promise<User | null> => {
    return new Promise((resolve) => {
      let unsubscribe = () => {};

      unsubscribe =
        onAuthStateChanged(
          auth,
          (user) => {
            unsubscribe();
            resolve(user);
          },
          () => {
            unsubscribe();
            resolve(null);
          }
        );
    });
  };

/**
 * Admin đăng nhập bằng Google.
 * Popup luôn cho chọn tài khoản để tránh nhầm Gmail.
 */
export const signInAdminWithGoogle =
  async () => {
    const result =
      await signInWithPopup(
        auth,
        googleProvider
      );

    return result.user;
  };

export const signOutAdmin =
  async () => {
    await signOut(auth);
  };

export { app };

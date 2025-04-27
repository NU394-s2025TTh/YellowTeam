import { User } from '@firebase/auth';

import { setData } from './utils';

export const createUser = async (user: User) => {
  const userFields = {
    name: user.displayName,
    profilePhoto: user.photoURL,
    uid: user.uid,
  };

  await setData(`/users/${user.uid}`, userFields);
};

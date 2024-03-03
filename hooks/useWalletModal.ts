import { useCallback } from 'react';

import { useRecoilState } from 'recoil';
import { walletModalState } from 'state/walletModalState';

export const useWalletModal = () => {
  const [state, setModalState] = useRecoilState(walletModalState);

  const closeModal = useCallback(() => {
    setModalState({ open: false });
  }, [setModalState]);

  const openModal = useCallback(() => {
    setModalState({ open: true });
  }, [setModalState]);

  return {
    closeModal,
    openModal,
    ...state,
  };
};

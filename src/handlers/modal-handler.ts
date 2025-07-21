type ModalHandler = {
  openModal(modalId: string): void;
  closeModal(modalId: string): void;
};

export const modalHandler: ModalHandler = {
  openModal: (modalId) => {
    console.log(`Opening modal: ${modalId}`);
  },
  closeModal: (modalId) => {
    console.log(`Closing modal: ${modalId}`);
  },
};

import { useEffect, useState, useCallback } from 'react';
import { useRegisterActions } from 'kbar';

import { useLocalDB } from 'db/LocalDBContext';
import { Project } from 'schemas/project';
import { Card } from 'schemas/card';

const useCards = (project: Project | null) => {
  const projectCode = project?.code || '';
  const { getCardsByProjectCode, createCard, deleteCard } = useLocalDB();

  const [cards, setCards] = useState<Card[]>([]);

  const fetchCards = useCallback(async () => {
    const cards = await getCardsByProjectCode(projectCode);
    setCards(cards);
  }, [getCardsByProjectCode, projectCode]);

  const handleCreateCard = useCallback(async () => {
    if (project) {
      await createCard(project);
      await fetchCards();
    }
  }, [project, createCard, fetchCards]);

  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      await deleteCard(cardId);
      await fetchCards();
    },
    [deleteCard, fetchCards]
  );

  useEffect(() => {
    if (project) fetchCards();
  }, [project]);

  useRegisterActions(
    [
      {
        id: 'addCard',
        name: 'New Card',
        keywords: 'add create',
        section: 'Card actions',
        perform: handleCreateCard,
      },
      {
        id: 'deleteCard',
        name: 'Delete Card',
        keywords: 'delete remove',
        section: 'Card actions',
        perform: () => null,
      },
    ],
    [handleCreateCard]
  );

  return { cards, handleCreateCard, handleDeleteCard };
};

export default useCards;

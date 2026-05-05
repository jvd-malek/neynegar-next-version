export type alertType = {
  _id: string;
  title: string;
  body: string;
  target: string;
  status: string;
  source: string;
  sourceId: string;
  readBy: {
    userId: {
      _id: string;
    };
    readAt: string;
  }[];
  createdAt: string;
};

export type paginatedAlertsType = {
  alerts: alertType[];
  totalPages: number;
  currentPage: number;
  total: number;
};
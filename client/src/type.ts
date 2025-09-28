export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: "ADMIN" | "USER" | "STORE_OWNER";
  createdAt: string;
  token: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  owner: User;
  overallRating: number | null;
  totalRatings: number;
  createdAt: string;
  userRating: number | null;
}

export interface Rating {
  id: string;
  userId: string;
  storeId: string;
  value: number;
  user: User;
  store: Store;
  createdAt: string;
  comment?: string;
}

import { createContext } from 'react';
import { CartContextType } from './cart-types';

export const CartContext = createContext<CartContextType | undefined>(undefined);
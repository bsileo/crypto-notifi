import Moralis from "moralis/types";

export type TokenBalance = {
  token_address: string;
  name: string;
  symbol: string;
  logo: string;
  thumbnail: string;
  decimals: number;
  balance: number;
};

export interface UserModel extends Moralis.User<Moralis.Attributes> {
  createdAt: Date;
}

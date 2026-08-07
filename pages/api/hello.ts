// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import problems from '../../src/data/problems.json'
import { CardResponseType } from '@/common/types/CardResponseType'
//API that is used to fill cards on our front page problems/page.tsx
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CardResponseType[]>
) {
  // We cast 'problems' to our type to ensure TypeScript is happy
  res.status(200).json(problems as CardResponseType[]);
}
//This is the Homepage/Module page of the website//
//This is connected to page.tsx under problems -> app (app/problems/page.tsx)
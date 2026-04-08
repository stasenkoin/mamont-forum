import { Response } from 'express';

export function setPaginationHeaders(
  res: Response,
  baseUrl: string,
  page: number,
  limit: number,
  total: number,
) {
  const totalPages = Math.ceil(total / limit);
  const links: string[] = [];

  if (page > 1) {
    links.push(`<${baseUrl}?page=${page - 1}&limit=${limit}>; rel="prev"`);
  }
  if (page < totalPages) {
    links.push(`<${baseUrl}?page=${page + 1}&limit=${limit}>; rel="next"`);
  }
  links.push(`<${baseUrl}?page=1&limit=${limit}>; rel="first"`);
  links.push(`<${baseUrl}?page=${totalPages}&limit=${limit}>; rel="last"`);

  if (links.length) {
    res.setHeader('Link', links.join(', '));
  }
  res.setHeader('X-Total-Count', total.toString());
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, Link');
}

import rss from '@astrojs/rss';
import { site } from '../data/site';
import { getPostsByLocale, postPath } from '../utils/blog';

export async function GET(context) {
  // English only — this is the site's one RSS feed, not a per-locale one.
  const posts = await getPostsByLocale('en');

  return rss({
    title: `${site.name} — Blog`,
    description: 'Plain-spoken articles for small business owners in the San Gabriel Valley.',
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postPath('en', post.data.slug),
    })),
  });
}

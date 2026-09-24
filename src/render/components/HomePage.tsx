import type { ContentEntry } from '../../helpers/loadPage.js';

 const HomePage = ({ pages }: { pages: ContentEntry[] }) => {
  return (
    <article className="home-content">
      <h1 className="home-heading">Acme Content</h1>
      {pages.length === 0 ? (
        <p>No pages yet.</p>
      ) : (
        <ul className="home-list">
          {pages.map((p) => (
            <li key={p.url} className="home-list-item">
              <a href={p.url}>
                {p.segments.at(-1)?.replaceAll('-', ' ')}
                {p.firstLine && <p className="home-list-item-preview">{p.firstLine}</p>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default HomePage;

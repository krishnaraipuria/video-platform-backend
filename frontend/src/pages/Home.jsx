import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import VideoCard, { VideoGrid } from "../components/VideoCard.jsx";
import { Empty, ErrorBox, Spinner } from "../components/ui.jsx";
import { api } from "../lib/api.js";

const CHIPS = [
  ["All", { sortBy: "createdAt", sortType: "desc" }],
  ["Most viewed", { sortBy: "views", sortType: "desc" }],
  ["Oldest", { sortBy: "createdAt", sortType: "asc" }],
];

export default function Home({ trending = false }) {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [chip, setChip] = useState(trending ? 1 : 0);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (p, replace) => {
    setLoading(true); setError("");
    try {
      const d = await api.videos({ page: p, limit: 12, query: q, ...CHIPS[chip][1] });
      setItems((prev) => (replace ? d.docs : [...prev, ...d.docs]));
      setPage(d.page); setMore(d.hasNextPage);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { setChip(trending ? 1 : 0); }, [trending]);
  useEffect(() => { load(1, true); /* eslint-disable-next-line */ }, [q, chip]);

  return (
    <div>
      <div className="mb-6 flex gap-3 overflow-x-auto" role="tablist" aria-label="Sort videos">
        {CHIPS.map(([label], i) => (
          <button key={label} role="tab" aria-selected={chip === i} onClick={() => setChip(i)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${chip === i ? "bg-white text-black" : "bg-yt-hover hover:bg-yt-line"}`}>{label}</button>
        ))}
      </div>
      {q && <p className="mb-4 text-yt-sub">Results for “{q}”</p>}
      {error && <ErrorBox message={error} onRetry={() => load(1, true)} />}
      {!error && items.length === 0 && !loading && (
        <Empty title={q ? "No videos match your search" : "No videos yet"} hint={q ? "Try different keywords." : "Be the first to upload one."} />
      )}
      <VideoGrid>{items.map((v) => <VideoCard key={v._id} video={v} />)}</VideoGrid>
      {loading && <Spinner label={items.length ? "Loading more…" : "Loading videos… (first load can take up to a minute)"} />}
      {more && !loading && <div className="mt-8 text-center"><button className="btn" onClick={() => load(page + 1, false)}>Show more</button></div>}
    </div>
  );
}

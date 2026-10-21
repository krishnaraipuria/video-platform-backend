import { Link } from "react-router-dom";
import VideoCard, { VideoGrid } from "../components/VideoCard.jsx";
import { Avatar, Empty, ErrorBox, PageTitle, Spinner } from "../components/ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api, resolveUsers } from "../lib/api.js";
import { useFetch } from "../lib/hooks.js";

export function History() {
  const { data, loading, error, reload } = useFetch(async () => (await api.history()).slice().reverse(), []);
  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle>Watch history</PageTitle>
      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && !data.length && <Empty icon="history" title="Nothing watched yet" hint="Videos you watch will show up here." />}
      <div className="space-y-4">{data?.map((v) => <VideoCard key={v._id} video={v} row />)}</div>
    </div>
  );
}

export function Liked() {
  const { data, loading, error, reload } = useFetch(async () => {
    const likes = await api.likedVideos();
    const videos = likes.map((l) => l.video).reverse();
    await resolveUsers(videos.map((v) => v.owner));
    return videos;
  }, []);
  return (
    <div>
      <PageTitle>Liked videos</PageTitle>
      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && !data.length && <Empty icon="like" title="No liked videos" hint="Tap Like on a video and it will be saved here." />}
      {data && <VideoGrid>{data.map((v) => <VideoCard key={v._id} video={v} />)}</VideoGrid>}
    </div>
  );
}

export function Subscriptions() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(async () => {
    const subs = await api.subscribedTo(user._id);
    const channels = subs.map((s) => s.channel).filter(Boolean);
    const ids = new Set(channels.map((c) => c._id));
    const feed = ids.size ? (await api.videos({ limit: 60 })).docs.filter((v) => ids.has(v.ownerDetails?._id)) : [];
    return { channels, feed };
  }, [user._id]);

  return (
    <div>
      <PageTitle>Subscriptions</PageTitle>
      {loading && <Spinner />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data && !data.channels.length && <Empty icon="subs" title="You haven't subscribed to anyone yet" hint="Subscribe to channels to see their latest videos here."><Link to="/" className="btn btn-white mt-3">Browse videos</Link></Empty>}
      {data?.channels.length > 0 && (
        <>
          <div className="mb-6 flex gap-5 overflow-x-auto pb-2">
            {data.channels.map((c) => (
              <Link key={c._id} to={`/channel/${c.username}`} className="flex w-20 shrink-0 flex-col items-center gap-2 text-center text-xs">
                <Avatar user={c} size={56} /><span className="w-full truncate">{c.fullname}</span>
              </Link>
            ))}
          </div>
          {!data.feed.length ? <p className="text-yt-sub">Your channels haven't posted recently.</p> : <VideoGrid>{data.feed.map((v) => <VideoCard key={v._id} video={v} />)}</VideoGrid>}
        </>
      )}
    </div>
  );
}

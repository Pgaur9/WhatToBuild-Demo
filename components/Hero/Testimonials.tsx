import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { GoodTextTestimonials } from "@/components/Hero/GoodText";

const TWEET_URL = "https://x.com/adxtya_jha/status/1955201701310321014";
const AVATAR_URL = "https://pbs.twimg.com/profile_images/1890067153073704961/lW-CFqgG_400x400.jpg";
const TWEET_TEXT = "All in one, gg man crazyy";

const reviews = Array.from({ length: 6 }).map(() => ({
  name: "Aditya",
  username: "@adxtya_jha",
  body: TWEET_TEXT,
  img: AVATAR_URL,
  href: TWEET_URL,
}));

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const TwitterBird = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M19.633 7.997c.013.178.013.357.013.535 0 5.454-4.154 11.747-11.747 11.747-2.337 0-4.503-.68-6.326-1.857.325.038.636.051.974.051a8.313 8.313 0 0 0 5.151-1.775 4.157 4.157 0 0 1-3.878-2.878c.254.038.51.064.777.064.374 0 .748-.051 1.096-.14A4.149 4.149 0 0 1 2.83 9.697v-.051c.546.305 1.18.497 1.854.523a4.145 4.145 0 0 1-1.85-3.45c0-.764.203-1.468.558-2.081a11.79 11.79 0 0 0 8.553 4.338 4.681 4.681 0 0 1-.102-.95 4.146 4.146 0 0 1 7.17-2.84 8.167 8.167 0 0 0 2.633-1.006 4.134 4.134 0 0 1-1.824 2.287 8.29 8.29 0 0 0 2.383-.637 8.897 8.897 0 0 1-2.192 2.28z"
    />
  </svg>
);

const ReviewCard = ({
  img,
  name,
  username,
  body,
  href,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
  href?: string;
}) => {
  const content = (
    <figure
      className={cn(
        "relative h-full w-72 sm:w-80 md:w-96 cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl border p-5 sm:p-6 md:p-7",
        "border-white/15 bg-black/40 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] backdrop-blur-2xl",
        "transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-black/55 hover:shadow-[0_10px_40px_rgba(0,0,0,0.35)]",
      )}
      role="article"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img className="rounded-full border border-white/10" width="40" height="40" alt="" src={img} />
          <div className="min-w-0">
            <figcaption className="text-sm font-semibold text-white truncate max-w-[11rem]">{name}</figcaption>
            <p className="text-xs font-medium text-white/60 truncate">{username}</p>
          </div>
        </div>
        <TwitterBird className="w-4 h-4 text-white/70" />
      </div>
      <blockquote className="mt-3 text-[0.95rem] sm:text-[1rem] leading-relaxed text-white/90 line-clamp-4">{body}</blockquote>
    </figure>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Open tweet">
      {content}
    </a>
  ) : (
    content
  );
};

export function Testimonials() {
  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-[2000px] flex-col items-center justify-center overflow-hidden px-4 sm:px-10 md:px-20 lg:px-40 py-12 sm:py-16 md:py-24",
      )}
    >
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)] tracking-wide"
          style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
        >
          <span className="inline-block align-middle"><GoodTextTestimonials /></span>
        </h2>
      </div>

      <Marquee
        pauseOnHover
        className="w-full px-2 sm:px-8 md:px-16 lg:px-32 [--duration:18s] sm:[--duration:22s] [--gap:0.75rem] sm:[--gap:1.25rem] lg:[--gap:1.75rem]"
        repeat={2}
      >
        {firstRow.map((review, idx) => (
          <ReviewCard key={`${review.username}-1-${idx}`} {...review} />
        ))}
      </Marquee>
      <Marquee
        reverse
        pauseOnHover
        className="w-full px-2 sm:px-8 md:px-16 lg:px-32 [--duration:18s] sm:[--duration:22s] [--gap:0.75rem] sm:[--gap:1.25rem] lg:[--gap:1.75rem]"
        repeat={2}
      >
        {secondRow.map((review, idx) => (
          <ReviewCard key={`${review.username}-2-${idx}`} {...review} />
        ))}
      </Marquee>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-32 md:w-48 lg:w-64 backdrop-blur-[6px] sm:backdrop-blur-[12px] [mask-image:linear-gradient(to_right,black_0%,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_70%,transparent_100%)]"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-32 md:w-48 lg:w-64 backdrop-blur-[6px] sm:backdrop-blur-[12px] [mask-image:linear-gradient(to_left,black_0%,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_left,black_0%,black_70%,transparent_100%)]"></div>
    </div>
  );
}

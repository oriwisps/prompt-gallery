import type { Case } from "./types";
export default function Cover({ item }: { item: Case }) {
  if (item.cover)
    return (
      <div className="cover">
        <img src={item.cover} alt={item.title + "封面"} />
      </div>
    );
  return (
    <div className={"cover cover-" + item.theme} aria-hidden="true">
      {item.theme === "glow" ? (
        <div className="art-button">
          Hover <span>↗</span>
        </div>
      ) : item.theme === "orbit" ? (
        <div className="art-orbit">
          <i />
          <i />
          <i />
          <b />
        </div>
      ) : item.theme === "glass" ? (
        <div className="art-glass">
          <strong>Glass Card</strong>
          <p>
            A clear and modern
            <br />
            blur effect.
          </p>
          <span>↗</span>
        </div>
      ) : item.theme === "type" ? (
        <div className="art-type">
          <strong>
            Make
            <br />
            Ideas Real.
          </strong>
          <small>Small prompts. Big possibilities.</small>
        </div>
      ) : item.theme === "particles" ? (
        <div className="art-particles">
          {Array.from({ length: 100 }, (_, i) => (
            <i
              key={i}
              style={{
                left: ((i * 37) % 100) + "%",
                top:
                  45 +
                  Math.sin((((i * 37) % 100) / 100) * 8) * 14 +
                  Math.cos(i * 8) * 18 +
                  "%",
                opacity: 0.3 + (i % 6) / 10,
                width: 1 + (i % 3),
                height: 1 + (i % 3),
              }}
            />
          ))}
        </div>
      ) : item.theme === "loader" ? (
        <div className="art-loader" />
      ) : (
        <div className="art-plain">
          <span>{"{ }"}</span>
          <small>YOUR NEXT IDEA</small>
        </div>
      )}
    </div>
  );
}

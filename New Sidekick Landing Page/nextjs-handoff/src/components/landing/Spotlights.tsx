import ThreadDemo from "./demos/ThreadDemo";
import AssetDemo from "./demos/AssetDemo";
import TrainingDemo from "./demos/TrainingDemo";

const serif = "var(--font-instrument-serif), Georgia, serif";
const ACCENT = "#1D6BF3";

const h2Style: React.CSSProperties = {
  fontFamily: serif,
  fontWeight: 400,
  fontSize: 34,
  lineHeight: 1.15,
  margin: "0 0 18px",
  color: ACCENT,
  textWrap: "balance",
};
const pStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.7,
  color: "#6E6A5D",
  margin: "0 0 24px",
  textWrap: "pretty",
};

export default function Spotlights() {
  return (
    <>
      {/* Work orders */}
      <section style={{ padding: "110px 36px" }}>
        <div style={{ maxWidth: 1020, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 72, alignItems: "center" }}>
          <div>
            <h2 style={h2Style}>
              Every issue,
              <br />
              one thread.
            </h2>
            <p style={pStyle}>
              Workers report problems in plain language: a broken freezer, a stuck door, a missing SOP. Sidekick triages, opens the work order, and keeps everyone posted in the same thread. No forms, no tickets, no chasing.
            </p>
          </div>
          <div style={{ height: 400 }}>
            <ThreadDemo accent={ACCENT} />
          </div>
        </div>
      </section>

      {/* Assets */}
      <section style={{ padding: "0 36px 110px" }}>
        <div style={{ maxWidth: 1020, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 72, alignItems: "center" }}>
          <div style={{ height: 460 }}>
            <AssetDemo accent={ACCENT} />
          </div>
          <div>
            <h2 style={h2Style}>Every asset, remembered by name.</h2>
            <p style={pStyle}>
              Sidekick keeps a living record of every machine, with manuals, service history, and runtime, and schedules preventive maintenance before things break.
            </p>
          </div>
        </div>
      </section>

      {/* Training */}
      <section style={{ padding: "0 36px 110px" }}>
        <div style={{ maxWidth: 1020, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 72, alignItems: "center" }}>
          <div>
            <h2 style={h2Style}>Training that meets the floor.</h2>
            <p style={pStyle}>
              New hires onboard over text: bite-size modules, walkthrough videos, and quizzes delivered in the flow of work. Managers see who&rsquo;s trained and certified at a glance.
            </p>
          </div>
          <div style={{ height: 460 }}>
            <TrainingDemo accent={ACCENT} />
          </div>
        </div>
      </section>
    </>
  );
}

import { useState } from "react";
import { CalendarDays, Plus, Download, MapPin } from "lucide-react";
import { locations, ScheduleEntry } from "@/data/mockData";
import MapView from "@/components/MapView";
import MagicBento from "@/components/MagicBento";
import TreviaLogo from "@/components/TreviaLogo";

const getNextDays = (count: number) => {
  const days: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
};

const upcomingDays = getNextDays(4);

const Planner = () => {
  const [selectedLoc, setSelectedLoc] = useState(locations[0].id);
  const [selectedDay, setSelectedDay] = useState(1);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([
    { id: "s1", day: 1, locationName: "India Gate", time: "09:00 AM" },
    { id: "s2", day: 1, locationName: "Taj Mahal", time: "02:00 PM" },
    { id: "s3", day: 2, locationName: "Jaipur City Palace", time: "10:00 AM" },
  ]);

  const addEntry = () => {
    const loc = locations.find((l) => l.id === selectedLoc);
    if (!loc) return;
    setSchedule([
      ...schedule,
      { id: `s${Date.now()}`, day: selectedDay, locationName: loc.name, time: "12:00 PM" },
    ]);
  };

  const dayGroups = schedule.reduce<Record<number, ScheduleEntry[]>>((acc, e) => {
    (acc[e.day] = acc[e.day] || []).push(e);
    return acc;
  }, {});

  const markers = schedule.map((s) => {
    const loc = locations.find((l) => l.name === s.locationName);
    return {
      lat: loc?.lat || 28.6,
      lng: loc?.lng || 77.2,
      label: s.locationName,
      sublabel: `Day ${s.day} – ${s.time}`,
    };
  });

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Fullscreen Map Background */}
      <div className="absolute inset-0 z-0">
        <MapView center={[26, 78]} zoom={5} markers={markers} className="h-full w-full !rounded-none" />
      </div>

      {/* Left Side Databox - Floating Panel */}
      <div className="absolute top-0 left-0 bottom-0 z-10 w-[380px] flex flex-col" style={{ background: "rgba(18,14,10,0.92)", backdropFilter: "blur(20px)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
          <TreviaLogo />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <MagicBento
            enableStars
            enableSpotlight
            enableBorderGlow={true}
            clickEffect
            spotlightRadius={300}
            particleCount={8}
            glowColor="212, 175, 55"
            className="rounded-2xl"
          >
            <div className="p-5 rounded-2xl space-y-4 border" style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.12)" }}>
              <select
                value={selectedLoc}
                onChange={(e) => setSelectedLoc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none border"
                style={{ background: "rgba(18,14,10,0.8)", color: "#d4af37", borderColor: "rgba(212,175,55,0.15)" }}
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>

              {/* Day selector */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.5)" }}>Select Day</p>
                <div className="grid grid-cols-4 gap-2">
                  {upcomingDays.map((dateStr, i) => {
                    const d = new Date(dateStr);
                    const dayNum = i + 1;
                    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
                    const dateLabel = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDay(dayNum)}
                        className="flex flex-col items-center px-2 py-2 rounded-lg text-xs font-medium transition-all duration-300 border"
                        style={{
                          background: selectedDay === dayNum ? "#d4af37" : "rgba(212,175,55,0.06)",
                          color: selectedDay === dayNum ? "#120e0a" : "rgba(212,175,55,0.6)",
                          borderColor: selectedDay === dayNum ? "#d4af37" : "rgba(212,175,55,0.12)",
                          boxShadow: selectedDay === dayNum ? "0 0 20px rgba(212,175,55,0.3)" : "none",
                        }}
                      >
                        <span>{dayLabel}</span>
                        <span className="text-[10px]">{dateLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={addEntry}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
                style={{
                  background: "#d4af37",
                  color: "#120e0a",
                  boxShadow: "0 0 20px rgba(212,175,55,0.2)",
                }}
              >
                <Plus className="w-4 h-4" /> Add to Schedule
              </button>
            </div>
          </MagicBento>

          {/* Timeline */}
          <MagicBento
            enableStars
            enableSpotlight
            enableBorderGlow={true}
            clickEffect
            spotlightRadius={300}
            particleCount={8}
            glowColor="212, 175, 55"
            className="rounded-2xl"
          >
            <div className="p-5 rounded-2xl border" style={{ background: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.12)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2" style={{ color: "#d4af37" }}>
                  <CalendarDays className="w-4 h-4" /> Schedule
                </h3>
                <button className="flex items-center gap-1 text-xs hover:underline" style={{ color: "#d4af37" }}>
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>
              {Object.entries(dayGroups).map(([day, entries]) => (
                <div key={day} className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#d4af37" }}>
                    Day {day} — {upcomingDays[Number(day) - 1] ? new Date(upcomingDays[Number(day) - 1]).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : `Day ${day}`}
                  </p>
                  {entries.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 py-2 pl-4 mb-1"
                      style={{ borderLeft: "2px solid rgba(212,175,55,0.3)" }}
                    >
                      <MapPin className="w-3 h-3 shrink-0" style={{ color: "#d4af37" }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "rgba(212,175,55,0.9)" }}>{e.locationName}</p>
                        <p className="text-xs" style={{ color: "rgba(212,175,55,0.5)" }}>{e.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </MagicBento>
        </div>
      </div>
    </div>
  );
};

export default Planner;

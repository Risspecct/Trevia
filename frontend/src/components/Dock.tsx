import { Home, LayoutDashboard, MapPinCheck, CalendarDays, Bus, Eye, MessageSquareQuote, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const dockItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: MapPinCheck, label: "Place Analysis", path: "/place-analysis" },
  { icon: MessageSquareQuote, label: "Reviews", path: "/reviews" },
  { icon: ShieldCheck, label: "Guardian", path: "/guardian" },
  { icon: CalendarDays, label: "Planner", path: "/planner" },
  { icon: Bus, label: "Transport", path: "/transport" },
  { icon: Eye, label: "Insights", path: "/insights" },
];

const Dock = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
      <div className="glass-card gold-border flex items-center gap-1 px-3 py-2 rounded-2xl shadow-lg" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(124,144,130,0.15)" }}>
        {dockItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "scale-110" : ""}`} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Dock;

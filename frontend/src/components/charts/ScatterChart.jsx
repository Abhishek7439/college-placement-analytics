import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend, Title);

export default function ScatterChart({ datasets, title, xTitle = "PC 1", yTitle = "PC 2", optionsOverride = {} }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { boxWidth: 12, font: { size: 12 } } },
      title: { display: !!title, text: title },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const raw = ctx.raw;
            return `${raw.label || "Point"}: (${raw.x}, ${raw.y}) | ${raw.extra || ""}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: !!xTitle, text: xTitle, font: { weight: "bold" } },
        grid: { color: "rgba(0,0,0,.06)" },
      },
      y: {
        title: { display: !!yTitle, text: yTitle, font: { weight: "bold" } },
        grid: { color: "rgba(0,0,0,.06)" },
      },
    },
    ...optionsOverride,
  };

  return (
    <div style={{ height: "350px", width: "100%" }}>
      <Scatter data={{ datasets }} options={options} />
    </div>
  );
}

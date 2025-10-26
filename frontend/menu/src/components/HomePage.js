import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const HomePage = () => {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    mostPopularItem: "",
    activeTables: 0
  });

  const [itemChartData, setItemChartData] = useState({
    labels: [],
    datasets: [{ label: "Total Quantity Sold", data: [], backgroundColor: [] }]
  });

  const [revenueChartData, setRevenueChartData] = useState({
    labels: [],
    datasets: [{ label: "Revenue", data: [], backgroundColor: [] }]
  });

  const [dailySalesData, setDailySalesData] = useState({
    labels: [],
    datasets: [
      {
        label: "Daily Revenue",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true
      }
    ]
  });

  useEffect(() => {
    fetch("http://localhost:5000/orders/bills")
      .then(res => res.json())
      .then(data => {
        setBills(data);
        calculateSummary(data);
        generateCharts(data);
        generateDailySales(data);
      })
      .catch(err => console.error("Error fetching bills:", err));
  }, []);

  const calculateSummary = (bills) => {
    const today = new Date().toISOString().slice(0, 10);
    let totalOrders = 0;
    let totalRevenue = 0;
    let itemCounts = {};
    let activeTablesSet = new Set();

    bills.forEach(bill => {
      const billDate = new Date(bill.created_at).toISOString().slice(0, 10);
      if (billDate === today) {
        totalOrders += 1;
        totalRevenue += bill.total_amount || 0;
      }

      activeTablesSet.add(bill.table_id);

      let items = [];
      try {
        items = bill.items ? JSON.parse(bill.items) : [];
      } catch (err) {
        console.error("Error parsing bill items:", err, bill.items);
      }

      items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const mostPopularItem = Object.keys(itemCounts).reduce(
      (a, b) => (itemCounts[a] > itemCounts[b] ? a : b),
      ""
    );

    setSummary({
      totalOrders,
      totalRevenue,
      mostPopularItem,
      activeTables: activeTablesSet.size
    });
  };

  const generateCharts = (bills) => {
    const itemCounts = {};
    const revenueByItem = {};

    bills.forEach(bill => {
      let items = [];
      try {
        items = bill.items ? JSON.parse(bill.items) : [];
      } catch (err) {
        console.error("Error parsing bill items:", err, bill.items);
      }

      items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        const itemRevenue = (item.price || 0) * item.quantity;
        revenueByItem[item.name] = (revenueByItem[item.name] || 0) + itemRevenue;
      });
    });

    setItemChartData({
      labels: Object.keys(itemCounts),
      datasets: [
        {
          label: "Total Quantity Sold",
          data: Object.values(itemCounts),
          backgroundColor: "rgba(75, 192, 192, 0.6)"
        }
      ]
    });

    setRevenueChartData({
      labels: Object.keys(revenueByItem),
      datasets: [
        {
          label: "Revenue",
          data: Object.values(revenueByItem),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#8AFF33",
            "#FF8333",
            "#8333FF"
          ]
        }
      ]
    });
  };

  const generateDailySales = (bills) => {
    const salesByDate = {};

    bills.forEach(bill => {
      const date = new Date(bill.created_at).toISOString().slice(0, 10);
      salesByDate[date] = (salesByDate[date] || 0) + (bill.total_amount || 0);
    });

    const sortedDates = Object.keys(salesByDate).sort();
    const sortedSales = sortedDates.map(date => salesByDate[date]);

    setDailySalesData({
      labels: sortedDates,
      datasets: [
        {
          label: "Daily Revenue",
          data: sortedSales,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true
        }
      ]
    });
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Restaurant Dashboard</h1>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Orders Today</h3>
          <p className="summary-value">{summary.totalOrders}</p>
        </div>
        <div className="summary-card">
          <h3>Total Revenue Today</h3>
          <p className="summary-value">₹ {summary.totalRevenue}</p>
        </div>
        <div className="summary-card">
          <h3>Most Popular Item</h3>
          <p className="summary-value">{summary.mostPopularItem}</p>
        </div>
        <div className="summary-card">
          <h3>Active Tables</h3>
          <p className="summary-value">{summary.activeTables}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-container">
        <div className="chart-wrapper">
          <h3 className="chart-title">Item Quantity Sold</h3>
          {itemChartData.labels.length > 0 ? <Bar data={itemChartData} /> : <p className="no-data">No data available</p>}
        </div>

        <div className="chart-wrapper">
          <h3 className="chart-title">Revenue by Item</h3>
          <div className="pie-chart-container">
            {revenueChartData.labels.length > 0 ? <Pie data={revenueChartData} /> : <p className="no-data">No data available</p>}
          </div>
        </div>

        <div className="chart-wrapper">
          <h3 className="chart-title">Daily Sales Revenue</h3>
          {dailySalesData.labels.length > 0 ? <Line data={dailySalesData} /> : <p className="no-data">No data available</p>}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
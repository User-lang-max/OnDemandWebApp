import React from "react";
import ReactApexChart from "react-apexcharts";

class BarChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: [],
      chartOptions: {},
    };
  }

  componentDidMount() {
    this.updateChart();
  }

  componentDidUpdate(prevProps) {
    // Mise à jour si les données ou les catégories changent
    if (prevProps.data !== this.props.data || prevProps.categories !== this.props.categories) {
      this.updateChart();
    }
  }

  updateChart = () => {
    const barChartOptions = {
      chart: {
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        theme: "dark",
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: "45%",
          distributed: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      xaxis: {
        // Catégories dynamiques
        categories: this.props.categories || [],
        labels: {
          style: {
            colors: "#A0AEC0",
            fontSize: "12px",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#A0AEC0",
            fontSize: "12px",
          },
          formatter: function (value) {
            return value + " MAD"; // Devise adaptée
          },
        },
      },
      colors: ["#3182CE", "#319795", "#D53F8C", "#DD6B20", "#805AD5"],
    };

    const barChartData = [
      {
        name: "Revenus",
        // Données dynamiques
        data: this.props.data || [],
      },
    ];

    this.setState({
      chartData: barChartData,
      chartOptions: barChartOptions,
    });
  };

  render() {
    return (
      <ReactApexChart
        options={this.state.chartOptions}
        series={this.state.chartData}
        type="bar"
        width="100%"
        height="100%"
      />
    );
  }
}

export default BarChart;
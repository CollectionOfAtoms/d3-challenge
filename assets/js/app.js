//Generates the main SVG element and
function setupChart() {
  // Define SVG area dimensions
  var svgWidth = 960;
  var svgHeight = 500;

  // Define the chart's margins as an object
  var margin = {
    top: 60,
    right: 60,
    bottom: 60,
    left: 60,
  };

  // Define dimensions of the chart area
  var chartWidth = svgWidth - margin.left - margin.right;
  var chartHeight = svgHeight - margin.top - margin.bottom;

  // Select body, append SVG area to it, and set its dimensions
  var svg = d3
    .select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append a group area, then set its margins
  var chartGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  return { chartGroup, chartWidth, chartHeight, svgWidth, svgHeight };
}

// Creates a linear scale of the data along the chosen axis
function makeScale(data, chosenXAxis, length, reverse = false) {
  // create scales
  var linearScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, (d) => d[chosenXAxis]) * 0.8,
      d3.max(data, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, length]);

  if (reverse) {
    linearScale.range([length, 0]);
  }

  return linearScale;
}

function main() {
  //Load the data
  d3.csv("./assets/data/data.csv").then((data) => {
    console.log(data);

    //Cast each numerical field to a number
    data.forEach((datum) => {
      datum.poverty = +datum.poverty;
      datum.povertyMoe = +datum.povertyMoe;
      datum.age = +datum.age;
      datum.ageMoe = +datum.ageMoe;
      datum.income = +datum.income;
      datum.incomeMoe = +datum.incomeMoe;
      datum.healthcare = +datum.healthcare;
      datum.healthcareLow = +datum.healthcareLow;
      datum.healthcareHigh = +datum.healthcareHigh;
      datum.obesity = +datum.obesity;
      datum.obesityLow = +datum.obesityLow;
      datum.obesityHigh = +datum.obesityHigh;
      datum.smokes = +datum.smokes;
      datum.smokesLow = +datum.smokesLow;
      datum.smokesHigh = +datum.smokesHigh;
    });

    var {
      chartGroup,
      chartWidth,
      chartHeight,
      svgWidth,
      svgHeight,
    } = setupChart();

    //Create the xScale and axis and append it
    var xScale = makeScale(data, "age", chartWidth);
    var bottomAxis = d3.axisBottom(xScale);

    var yScale = makeScale(data, "smokes", chartHeight, true);
    var leftAxis = d3.axisLeft(yScale);

    // append axes
    var xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g").classed("y-axis", true).call(leftAxis);

    // append initial circles

    var circleGroups = chartGroup
      .selectAll("circle")
      .data(data)
      .enter()
      .append("g");

    circleGroups
      .append("circle")
      .attr("cx", (d) => xScale(d.age))
      .attr("cy", (d) => yScale(d.smokes))
      .attr("r", 20)
      .attr("fill", "blue")
      .attr("opacity", ".7");
    circleGroups
      .append("text")
      .text((d) => d.abbr)
      .attr("x", (d) => xScale(d.age))
      .attr("y", (d) => yScale(d.smokes) + 5)
      .attr("fill", "white")
      .style("text-anchor", "middle");

    // Axis labels
    chartGroup
      .append("text")
      .text("Percentage of Smokers")
      .attr("transform", `translate(-35, ${chartHeight / 2} ) rotate(-90)`)
      .attr("text-anchor", "middle");

    chartGroup
      .append("text")
      .text("Median Age")
      .attr("transform", `translate(${chartHeight + 35}, ${chartWidth / 2})`)
      .attr("text-anchor", "middle");
  });
}

main();

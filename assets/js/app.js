//Generates the main SVG element and
var chosenXAxis = "age";
var chosenYAxis = "smokes";
var xAxis;
var yAxis;

numericalAxes = [
  { axis: "poverty", label: "Percentage in Poverty" },
  { axis: "age", label: "Median Age" },
  { axis: "income", label: "Median Income" },
  {
    axis: "healthcare",
    label: "Percentage of People Insured (Avergaged estimate",
  },
  {
    axis: "healthcareLow",
    label: "Percentage of People Insured (Low estimate)",
  },
  {
    axis: "healthcareHigh",
    label: "Percentage of People Insured (High estimate)",
  },
  { axis: "obesity", label: "Percentage of People with Obesity" },
  {
    axis: "obesityLow",
    label: "Percentage of People with Obesity (Low Estimate)",
  },
  {
    axis: "obesityHigh",
    label: "Percentage of People with Obesity (High Estimate",
  },
  { axis: "smokes", label: "Percentage of Smokes" },
  { axis: "smokesLow", label: "Percentage of Smokers (Low estimate)" },
  { axis: "smokesHigh", label: "Percentage of Smokers (High estimate" },
];

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

//Cycles the chosenXAxis and chosenYAxis through a list of valid columns
function cycleAxis(currentAxis, dimension) {
  nextIndex = numericalAxes.map((d) => d.axis).indexOf(currentAxis) + 1;

  if (nextIndex == numericalAxes.length) {
    nextIndex = 0;
  }

  if (dimension == "x") chosenXAxis = numericalAxes[nextIndex].label;
  else if (dimension == "x") chosenYAxis = numericalAxes[nextIndex].label;
}

//Transitions the Axes
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition().duration(1000).call(bottomAxis);

  return xAxis;
}

//Transitions circles to new location when new axis is chosen
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup
    .transition()
    .duration(1000)
    .attr("cx", (d) => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function applyToolTip(circlesGroup) {
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .attr("fill", "gray")
    .offset([50, -50])
    .html(function (d) {
      return `${d.state} <br> ${chosenXAxis} : ${d[chosenXAxis]} <br> ${chosenYAxis} : ${d[chosenYAxis]}`;
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", function (data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
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
    var xScale = makeScale(data, chosenXAxis, chartWidth);
    var bottomAxis = d3.axisBottom(xScale);

    var yScale = makeScale(data, chosenYAxis, chartHeight, true);
    var leftAxis = d3.axisLeft(yScale);

    // append axes
    var xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g").classed("y-axis", true).call(leftAxis);

    // append initial circles

    // Setup groups for Circle and Label to live in.
    var circleGroups = chartGroup
      .selectAll(".circleGroup")
      .data(data)
      .enter()
      .append("g")
      .classed("circleGroup", true)
      .attr(
        "transform",
        (d) => `translate(${xScale(d[chosenXAxis])}, ${yScale(d[chosenYAxis])})`
      );

    circleGroups
      .append("circle")
      .attr("r", 20)
      .attr("fill", "blue")
      .attr("opacity", ".7");
    circleGroups
      .append("text")
      .text((d) => d.abbr)
      .attr("y", (d) => 5)
      .attr("fill", "white")
      .style("text-anchor", "middle");

    // Axis labels
    axisData =
      numericalAxes[numericalAxes.map((d) => d.axis).indexOf(chosenXAxis)];
    chartGroup
      .append("text")
      .text(axisData.label)
      .attr("id", "xLabel")
      .attr("value", axisData.axis)
      .attr("transform", `translate(${chartHeight + 35}, ${chartWidth / 2})`)
      .attr("text-anchor", "middle");

    //Add OnClick listener to transition X-axis to a new value when xLabel is clicked
    chartGroup.select("#xLabel").on("click", function () {
      var value = d3.select(this).attr("value");
    });

    chartGroup
      .append("text")
      .text(
        numericalAxes[numericalAxes.map((d) => d.axis).indexOf(chosenYAxis)]
          .label
      )
      .attr("transform", `translate(-35, ${chartHeight / 2} ) rotate(-90)`)
      .attr("text-anchor", "middle");

    applyToolTip(circleGroups);
  });
}

main();

const officialStateDirectory = "https://rti.dopt.gov.in/rtistatelink.php";

const authorities = [
  ["Ministry of Railways", ["railway", "train", "station", "irctc"]],
  ["Ministry of Education", ["education", "school", "university", "ugc", "student"]],
  ["Ministry of Health and Family Welfare", ["health", "hospital", "medicine", "aiims"]],
  ["Ministry of Home Affairs", ["home affairs", "security", "citizenship", "census"]],
  ["Ministry of Rural Development", ["rural", "mgnrega", "nrega", "village", "housing"]],
  ["Ministry of Road Transport and Highways", ["highway", "road", "vehicle", "driving licence"]],
  ["Department of Posts", ["post office", "postal", "speed post"]],
  ["Department of Revenue", ["income tax", "customs", "gst", "revenue"]],
  ["Department of Personnel and Training", ["government employee", "service rule", "dopt", "rti"]],
  ["Employees' Provident Fund Organisation", ["epfo", "provident fund", "pf", "pension"]],
  ["Ministry of Labour and Employment", ["labour", "employment", "worker", "esic"]],
  ["Ministry of Social Justice and Empowerment", ["scholarship", "disability", "social justice"]],
  ["Ministry of Tribal Affairs", ["tribal", "scheduled tribe", "forest rights"]],
  ["Ministry of Agriculture and Farmers Welfare", ["farmer", "agriculture", "crop", "pm kisan"]],
  ["Ministry of Consumer Affairs, Food and Public Distribution", ["ration", "food", "consumer", "pds"]],
  ["Ministry of Housing and Urban Affairs", ["urban", "housing", "metro", "smart city"]],
  ["Ministry of External Affairs", ["passport", "embassy", "visa", "foreign affairs"]],
  ["Unique Identification Authority of India", ["aadhaar", "uidai", "identity"]],
  ["Election Commission of India", ["election", "voter", "electoral"]],
  ["Central Information Commission", ["second appeal", "information commission", "cic"]],
].map(([name, keywords], index) => ({ id: `central-${index + 1}`, name, level: "central", keywords }));

const states = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

module.exports = { authorities, states, officialStateDirectory };

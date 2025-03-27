const axios = require("axios");

const baseURL = "http://localhost:3000";

const actions = {
  list: async () => {
    const res = await axios.get(`${baseURL}/anchors`);
    console.log(JSON.stringify(res.data, null, 2));
  },

  get: async (cid) => {
    const res = await axios.get(`${baseURL}/anchor/${cid}`);
    console.log(JSON.stringify(res.data, null, 2));
  },

  anchor: async (cid, note, signed_by, signature) => {
    const res = await axios.post(`${baseURL}/anchor`, {
      cid,
      note,
      signed_by,
      signature,
    });
    console.log("Anchor success:", res.data);
  },

  vote: async (cid) => {
    const res = await axios.post(`${baseURL}/vote`, { cid });
    console.log("Vote recorded:", res.data);
  },

  flag: async (cid) => {
    const res = await axios.post(`${baseURL}/flag`, { cid });
    console.log("Flag recorded:", res.data);
  },

  filter: async (...args) => {
    const res = await axios.get(`${baseURL}/anchors`);
    let anchors = res.data.anchors;

    if (args[0] === "signed_by" && args[1]) {
      anchors = anchors.filter(a => a.signed_by === args[1]);
    } else if (args[0] === "trustworthy") {
      anchors = anchors.filter(a => (a.votes || 0) > (a.flags || 0));
    } else if (args[0] === "sort" && args[1] === "votes") {
      anchors = anchors.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    } else if (args[0] === "sort" && args[1] === "newest") {
      anchors = anchors.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
      console.log("Unknown filter command.");
      return;
    }

    console.log(JSON.stringify(anchors, null, 2));
  }
};

(async () => {
  const [_, __, cmd, ...args] = process.argv;

  try {
    if (!actions[cmd]) throw new Error("Unknown command");

    await actions[cmd](...args);
  } catch (err) {
    console.error("Error:", err.message);
    console.log("Usage:");
    console.log("  node cli.js list");
    console.log("  node cli.js get <cid>");
    console.log("  node cli.js anchor <cid> <note> <signed_by> <signature>");
    console.log("  node cli.js vote <cid>");
    console.log("  node cli.js flag <cid>");
    console.log("  node cli.js filter signed_by <name>");
    console.log("  node cli.js filter trustworthy");
    console.log("  node cli.js filter sort votes");
    console.log("  node cli.js filter sort newest");
  }
})();

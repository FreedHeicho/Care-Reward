import { Router, type IRouter } from "express";

const router: IRouter = Router();

const NPPES_BASE = "https://npiregistry.cms.hhs.gov/api/";

router.get("/providers/search", async (req, res) => {
  const { first_name, last_name, number, limit = "20" } = req.query;

  const params = new URLSearchParams({ version: "2.1", limit: String(limit) });
  if (number)     params.append("number",     String(number));
  if (first_name) params.append("first_name", String(first_name));
  if (last_name)  params.append("last_name",  String(last_name));

  const url = `${NPPES_BASE}?${params.toString()}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        Accept:       "application/json",
        "User-Agent": "CareReward/1.0",
      },
    });

    if (!upstream.ok) {
      req.log.error({ status: upstream.status }, "NPPES upstream error");
      res.status(upstream.status).json({
        error:  "NPPES API returned an error",
        status: upstream.status,
      });
      return;
    }

    const data: unknown = await upstream.json();
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "NPPES proxy fetch failed");
    res.status(500).json({ error: "Failed to reach NPPES registry" });
  }
});

export default router;

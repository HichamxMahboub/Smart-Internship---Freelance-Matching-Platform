// Test the denormalized aggregation pipelines used by the n8n agent tools.
const skillNames = { $map: { input: { $ifNull: [{ $first: "$profile.skills" }, []] }, as: "s", in: { $ifNull: ["$$s.name", "$$s"] } } };

print("================ CANDIDATES ================");
printjson(db.users.aggregate([
  { $match: { role: "CANDIDATE" } },
  { $addFields: { uid: { $toString: "$_id" } } },
  { $lookup: { from: "candidate_profiles", localField: "uid", foreignField: "userId", as: "profile" } },
  { $lookup: { from: "ai_results", localField: "uid", foreignField: "userId", as: "ai" } },
  { $project: {
      _id: 0, fullName: 1, email: 1,
      headline: { $first: "$profile.headline" },
      fieldOfStudy: { $first: "$profile.fieldOfStudy" },
      location: { $first: "$profile.location" },
      skills: skillNames,
      seniority: { $first: "$ai.seniority" },
      profileType: { $first: "$ai.profileType" },
      primaryStack: { $first: "$ai.primaryStack" }
  } }
]).toArray());

print("================ OFFERS (with applicants) ================");
printjson(db.offers.aggregate([
  { $addFields: { oid: { $toString: "$_id" } } },
  { $lookup: { from: "companies", let: { cid: "$companyId" }, pipeline: [
      { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$cid"] } } },
      { $project: { _id: 0, name: 1 } }
    ], as: "company" } },
  { $lookup: { from: "applications", localField: "oid", foreignField: "offerId", as: "apps" } },
  { $lookup: { from: "users", let: { ids: { $map: { input: "$apps", as: "a", in: "$$a.candidateId" } } }, pipeline: [
      { $match: { $expr: { $in: [{ $toString: "$_id" }, "$$ids"] } } },
      { $project: { _id: 1, fullName: 1 } }
    ], as: "appUsers" } },
  { $project: {
      _id: 0, title: 1, type: 1, location: 1, duration: 1, requiredSkills: 1, status: 1,
      company: { $first: "$company.name" },
      applicantCount: { $size: "$apps" },
      applicants: { $map: { input: "$apps", as: "a", in: {
        candidate: { $first: { $map: { input: { $filter: { input: "$appUsers", as: "u", cond: { $eq: [{ $toString: "$$u._id" }, "$$a.candidateId"] } } }, as: "u2", in: "$$u2.fullName" } } },
        matchingScore: "$$a.matchingScore",
        status: "$$a.status"
      } } }
  } }
]).toArray());

print("================ APPLICATIONS (enriched) ================");
printjson(db.applications.aggregate([
  { $lookup: { from: "offers", let: { oid: "$offerId" }, pipeline: [
      { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$oid"] } } }, { $project: { _id: 0, title: 1 } }
    ], as: "offer" } },
  { $lookup: { from: "users", let: { cid: "$candidateId" }, pipeline: [
      { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$cid"] } } }, { $project: { _id: 0, fullName: 1 } }
    ], as: "cand" } },
  { $project: { _id: 0, candidate: { $first: "$cand.fullName" }, offer: { $first: "$offer.title" }, status: 1, matchingScore: 1, appliedAt: 1 } }
]).toArray());

print("================ COMPANIES (with offers) ================");
printjson(db.companies.aggregate([
  { $addFields: { cid: { $toString: "$_id" } } },
  { $lookup: { from: "offers", localField: "cid", foreignField: "companyId", as: "offers" } },
  { $project: { _id: 0, name: 1, sector: 1, validationStatus: 1, website: 1,
      offerCount: { $size: "$offers" }, offerTitles: { $map: { input: "$offers", as: "o", in: "$$o.title" } } } }
]).toArray());

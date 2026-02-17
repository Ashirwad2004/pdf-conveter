"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobs_1 = require("../controllers/jobs");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
router.post('/', (0, validate_1.validate)(jobs_1.createJobSchema), jobs_1.createJob);
exports.default = router;

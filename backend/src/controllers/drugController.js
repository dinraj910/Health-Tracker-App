import { asyncHandler } from "../middleware/errorMiddleware.js";
import {
  searchDrugs,
  getDrugById,
  getDrugsByCategory,
} from "../services/openFdaService.js";

/**
 * @desc    Search drugs by name
 * @route   GET /api/drugs/search?q=aspirin&limit=20&skip=0
 * @access  Private
 */
export const searchDrugsByName = asyncHandler(async (req, res) => {
  const { q, limit = 20, skip = 0 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Search query must be at least 2 characters",
    });
  }

  const data = await searchDrugs(q, parseInt(limit), parseInt(skip));

  res.status(200).json({
    success: true,
    data: {
      drugs: data.results,
      total: data.total,
      query: q,
    },
  });
});

/**
 * @desc    Get drug details by ID (set_id or application_number)
 * @route   GET /api/drugs/:id
 * @access  Private
 */
export const getDrugDetails = asyncHandler(async (req, res) => {
  const drug = await getDrugById(req.params.id);

  if (!drug) {
    return res.status(404).json({
      success: false,
      message: "Drug not found",
    });
  }

  res.status(200).json({
    success: true,
    data: { drug },
  });
});

/**
 * @desc    Browse drugs by category/purpose
 * @route   GET /api/drugs/category/:category
 * @access  Private
 */
export const browseDrugsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 20 } = req.query;

  const data = await getDrugsByCategory(category, parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      drugs: data.results,
      total: data.total,
      category,
    },
  });
});

export default { searchDrugsByName, getDrugDetails, browseDrugsByCategory };

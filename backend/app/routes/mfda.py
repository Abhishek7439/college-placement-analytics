from flask import Blueprint, request, jsonify

from ..utils.mfda_service import (
    get_descriptive_and_linear_algebra,
    get_probability_and_bayes,
    get_distribution_analysis,
    get_sampling_and_clt,
    get_estimation_analysis,
    get_regression_analysis,
    predict_student_placement,
    get_hypothesis_testing,
    get_non_parametric_tests,
)

mfda_bp = Blueprint("mfda", __name__)


@mfda_bp.route("/descriptive-linear-algebra", methods=["GET"])
def descriptive_linear_algebra():
    """Practical 02 & 03: Descriptive summarizing, Covariance, Correlation, PCA."""
    data = get_descriptive_and_linear_algebra()
    return jsonify(data), 200


@mfda_bp.route("/probability-bayes", methods=["GET", "POST"])
def probability_bayes():
    """Practical 04: Probability theory, random variables, Bayes' theorem."""
    if request.method == "POST":
        criteria = request.get_json(silent=True) or {}
    else:
        criteria = {
            "cgpa_min": request.args.get("cgpa_min", 8.0, type=float),
            "internships_min": request.args.get("internships_min", 1, type=int),
            "tech_min": request.args.get("tech_min", 70.0, type=float),
        }
    data = get_probability_and_bayes(criteria=criteria)
    return jsonify(data), 200


@mfda_bp.route("/distributions", methods=["GET"])
def distributions():
    """Practical 04: Probability distributions (Normal, Binomial, Poisson)."""
    data = get_distribution_analysis()
    return jsonify(data), 200


@mfda_bp.route("/sampling-clt", methods=["GET"])
def sampling_clt():
    """Practical 05: Sampling techniques and Central Limit Theorem simulation."""
    sample_size = request.args.get("sample_size", 30, type=int)
    num_samples = request.args.get("num_samples", 500, type=int)
    data = get_sampling_and_clt(sample_size=sample_size, num_samples=num_samples)
    return jsonify(data), 200


@mfda_bp.route("/estimation", methods=["GET"])
def estimation():
    """Practical 06: Point and Interval Estimation (Confidence Intervals)."""
    data = get_estimation_analysis()
    return jsonify(data), 200


@mfda_bp.route("/regression", methods=["GET"])
def regression():
    """Practical 07: Multiple Linear & Logistic Regression models."""
    data = get_regression_analysis()
    return jsonify(data), 200


@mfda_bp.route("/predict", methods=["POST"])
def predict():
    """Practical 07: Interactive placement probability & package predictor."""
    body = request.get_json(silent=True) or {}
    res = predict_student_placement(body)
    return jsonify(res), 200


@mfda_bp.route("/hypothesis-testing", methods=["GET"])
def hypothesis_testing():
    """Practical 08: Parametric tests (t-tests, ANOVA)."""
    alpha = request.args.get("alpha", 0.05, type=float)
    data = get_hypothesis_testing(alpha=alpha)
    return jsonify(data), 200


@mfda_bp.route("/non-parametric", methods=["GET"])
def non_parametric():
    """Practical 09: Non-parametric tests (Chi-square independence, Mann-Whitney U)."""
    data = get_non_parametric_tests()
    return jsonify(data), 200

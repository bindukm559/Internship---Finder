from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

INTERNSHIPS_FILE = os.path.join(DATA_DIR, "internships.json")
SAVED_FILE = os.path.join(DATA_DIR, "saved.json")


def load_internships():
    with open(INTERNSHIPS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def load_saved():
    with open(SAVED_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_saved(data):
    with open(SAVED_FILE, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "message": "Internship Finder backend is running"
    }), 200


@app.route("/api/internships", methods=["GET"])
def get_internships():
    internships = load_internships()

    search = request.args.get("search", "").strip().lower()
    category = request.args.get("category", "").strip().lower()
    mode = request.args.get("mode", "").strip().lower()
    location = request.args.get("location", "").strip().lower()

    filtered = internships

    # Search
    if search:
        filtered = [
            internship for internship in filtered
            if search in internship["title"].lower()
            or search in internship["company"].lower()
            or search in internship["description"].lower()
            or any(
                search in skill.lower()
                for skill in internship["skills"]
            )
        ]

    # Category filter
    if category:
        filtered = [
            internship for internship in filtered
            if internship["category"].lower() == category
        ]

    # Mode filter
    if mode:
        filtered = [
            internship for internship in filtered
            if internship["mode"].lower() == mode
        ]

    # Location filter
    if location:
        filtered = [
            internship for internship in filtered
            if location in internship["location"].lower()
        ]

    return jsonify({
        "success": True,
        "count": len(filtered),
        "data": filtered
    }), 200

@app.route("/api/internships/<int:internship_id>", methods=["GET"])
def get_internship(internship_id):
    ...
    

@app.route("/api/categories", methods=["GET"])
def get_categories():
    internships = load_internships()

    categories = sorted(
        set(internship["category"] for internship in internships)
    )

    return jsonify({
        "success": True,
        "data": categories
    }), 200

# PART 20 - GET SAVED INTERNSHIPS
@app.route("/api/saved", methods=["GET"])
def get_saved():
    internships = load_internships()
    saved_ids = load_saved()

    saved_internships = [
        internship for internship in internships
        if internship["id"] in saved_ids
    ]

    return jsonify({
        "success": True,
        "count": len(saved_internships),
        "data": saved_internships
    }), 200

# PART 21 - SAVE INTERNSHIP
@app.route("/api/saved", methods=["POST"])
def save_internship():
    data = request.get_json(silent=True)

    # Check whether request body exists
    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    # Get internship ID
    internship_id = data.get("internship_id")

    # Check whether internship_id was provided
    if internship_id is None:
        return jsonify({
            "success": False,
            "message": "internship_id is required"
        }), 400

    # Check data type
    if not isinstance(internship_id, int):
        return jsonify({
            "success": False,
            "message": "internship_id must be an integer"
        }), 400

    # Load all internships
    internships = load_internships()

    # Check whether internship exists
    internship_exists = any(
        internship["id"] == internship_id
        for internship in internships
    )

    if not internship_exists:
        return jsonify({
            "success": False,
            "message": "Internship not found"
        }), 404

    # Load saved internships
    saved_ids = load_saved()

    # Check duplicate
    if internship_id in saved_ids:
        return jsonify({
            "success": False,
            "message": "Internship is already saved"
        }), 409

    # Save internship
    saved_ids.append(internship_id)
    save_saved(saved_ids)

    return jsonify({
        "success": True,
        "message": "Internship saved successfully",
        "internship_id": internship_id
    }), 201

# PART 22 - REMOVE SAVED INTERNSHIP
@app.route("/api/saved/<int:internship_id>", methods=["DELETE"])
def delete_saved(internship_id):
    saved_ids = load_saved()

    if internship_id not in saved_ids:
        return jsonify({
            "success": False,
            "message": "Internship is not saved"
        }), 404

    saved_ids.remove(internship_id)
    save_saved(saved_ids)

    return jsonify({
        "success": True,
        "message": "Internship removed from saved internships"
    }), 200

# PART 23 - 404 ERROR HANDLER
@app.errorhandler(404)
def page_not_found(error):
    return jsonify({
        "success": False,
        "message": "API endpoint not found"
    }), 404

# PART 23 - 500 ERROR HANDLER
@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)

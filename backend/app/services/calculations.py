"""Service for nutritional calculations (BMR, TDEE, macros)"""


def calculate_bmr(sex: str, age: int, height: int, weight: int) -> float:
    """
    Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
    - sex: "male" or "female"
    - age: in years
    - height: in cm
    - weight: in kg
    Returns: BMR in kcal/day
    """
    if sex.lower() == "male":
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
    elif sex.lower() == "female":
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
    else:
        # Default to average of male and female if not specified
        male_bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
        female_bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
        bmr = (male_bmr + female_bmr) / 2

    return round(bmr)


def calculate_tdee(bmr: float, activity_level: float = 1.55) -> int:
    """
    Calculate Total Daily Energy Expenditure
    - bmr: Basal Metabolic Rate
    - activity_level: multiplier for activity (default: 1.55 = moderately active)
      1.2 = sedentary
      1.375 = lightly active
      1.55 = moderately active
      1.725 = very active
      1.9 = extremely active
    Returns: TDEE in kcal/day
    """
    return round(bmr * activity_level)


def adjust_calories_for_goal(tdee: int, goal: str) -> int:
    """
    Adjust daily calorie recommendation based on goal
    - goal: "lose", "maintain", or "gain"
    Returns: adjusted daily calorie target
    """
    if goal.lower() == "lose":
        return round(tdee - 500)  # 0.5kg loss per week
    elif goal.lower() == "gain":
        return round(tdee + 500)  # 0.5kg gain per week
    else:  # maintain
        return tdee


def calculate_macros(calories: int, weight: int, goal: str) -> dict:
    """
    Calculate daily macro recommendations based on calories and goal
    - calories: target daily calories
    - weight: body weight in kg
    - goal: "lose", "maintain", or "gain"
    Returns: dict with protein, carbs, fat in grams
    """
    # Adjust macro ratios based on goal
    if goal.lower() == "lose":
        # Higher protein to preserve muscle: 30% protein, 40% carbs, 30% fat
        protein_ratio = 0.30
        carb_ratio = 0.40
        fat_ratio = 0.30
        # Protein: 1.8-2.2g per kg (higher for weight loss to preserve muscle)
        protein_grams = round(weight * 2.0)
    elif goal.lower() == "gain":
        # Higher calories with balanced macros: 25% protein, 50% carbs, 25% fat
        protein_ratio = 0.25
        carb_ratio = 0.50
        fat_ratio = 0.25
        # Protein: 1.6-2.0g per kg for muscle gain
        protein_grams = round(weight * 1.8)
    else:  # maintain
        # Balanced approach: 25% protein, 50% carbs, 25% fat
        protein_ratio = 0.25
        carb_ratio = 0.50
        fat_ratio = 0.25
        # Protein: 1.6g per kg for maintenance
        protein_grams = round(weight * 1.6)

    # Calculate remaining calories for carbs and fat
    protein_calories = protein_grams * 4  # 4 cal per gram
    remaining_calories = calories - protein_calories

    # Distribute remaining between carbs and fat
    carb_calories = remaining_calories * (carb_ratio / (carb_ratio + fat_ratio))
    fat_calories = remaining_calories * (fat_ratio / (carb_ratio + fat_ratio))

    carb_grams = round(carb_calories / 4)  # 4 cal per gram
    fat_grams = round(fat_calories / 9)  # 9 cal per gram

    return {
        "protein": protein_grams,
        "carbs": carb_grams,
        "fat": fat_grams
    }


def get_nutrition_goals(sex: str, age: int, height: int, weight: int, goal: str) -> dict:
    """
    Get complete nutrition goals for a user
    Returns: dict with calories and macro targets
    """
    bmr = calculate_bmr(sex, age, height, weight)
    tdee = calculate_tdee(bmr)
    daily_calories = adjust_calories_for_goal(tdee, goal)
    macros = calculate_macros(daily_calories, weight, goal)

    return {
        "bmr": bmr,
        "tdee": tdee,
        "calories": daily_calories,
        "protein": macros["protein"],
        "carbs": macros["carbs"],
        "fat": macros["fat"]
    }

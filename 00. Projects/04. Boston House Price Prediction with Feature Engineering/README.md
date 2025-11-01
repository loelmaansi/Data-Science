# 📈 Boston House Price Prediction

This project uses machine learning to predict house prices based on the classic Boston Housing dataset. The goal is to build and evaluate several regression models to find the one that best predicts the **MEDV** (Median value of owner-occupied homes in $1000s).

## 📓 Project Notebook

The entire analysis and model implementation are contained in the Jupyter Notebook:
* **`Boston House price prediction.ipynb`**: This notebook covers the complete workflow from data loading and exploration to model training and evaluation.

## 🛠️ Project Workflow

### 1. Data Loading & Exploration
* **Libraries**: Imports essential libraries including `pandas`, `numpy`, `sklearn`, `matplotlib`, and `seaborn`.
* **Dataset**: Loads the Boston Housing dataset using `sklearn.datasets.load_boston()`.
* **EDA**: Creates a `pandas` DataFrame to analyze the data. This includes:
    * Checking the shape of the data.
    * Generating descriptive statistics (`.describe()`).
    * Checking for null values (`.isnull().sum()`).
    * Visualizing the distribution of the target variable (`MEDV`) using a `seaborn.distplot`.
    * Creating a correlation heatmap (`seaborn.heatmap`) to understand relationships between features.

### 2. Data Preprocessing
* **Feature Selection**: The features (`X`) and the target variable (`y`) are defined.
* **Train-Test Split**: The data is split into training and testing sets using `sklearn.model_selection.train_test_split`.
* **Feature Scaling**: `sklearn.preprocessing.StandardScaler` is used to scale the features, which is crucial for models like Linear Regression, Ridge, and Lasso.

### 3. Model Training & Evaluation

Four different regression models are trained and evaluated:

1.  **Linear Regression** (`sklearn.linear_model.LinearRegression`)
2.  **Lasso Regression** (`sklearn.linear_model.Lasso`)
3.  **Ridge Regression** (`sklearn.linear_model.Ridge`)
4.  **ElasticNet Regression** (`sklearn.linear_model.ElasticNet`)

### 4. Model Performance

The models are evaluated using **R-squared ($R^2$)** and **Adjusted R-squared** on the test set.

* The performance of all four models is printed.
* The residuals (the difference between predicted and actual values) for the Linear Regression model are plotted to check for normal distribution, a key assumption of linear regression.

# 📈 Boston House Price Prediction
This project uses machine learning to compare multiple feature selection techniques on the classic Boston Housing dataset. The goal is to identify which features actually drive price and which are redundant, while predicting **PRICE** (Median value of owner-occupied homes in $1000s).
## 📓 Project Notebook
The entire analysis and model implementation are contained in the Jupyter Notebook:
* **`Boston House price prediction.ipynb`**: This notebook covers the complete workflow from data loading and exploration to feature selection and model evaluation across six different approaches.
## 🛠️ Project Workflow
### 1. Data Loading & Exploration
* **Libraries**: Imports essential libraries including `pandas`, `numpy`, `matplotlib`, `seaborn`, and `statsmodels`.
* **Dataset**: Loads the Boston Housing dataset from `data/boston.csv` (the `sklearn.datasets.load_boston()` loader was removed in scikit-learn 1.2+ due to ethical concerns with one of its features).
* **EDA**: Creates a `pandas` DataFrame to analyze the data. This includes:
    * Generating descriptive statistics (`.describe()`).
    * Computing a full correlation matrix and visualizing it as a `seaborn.heatmap`.
    * Pairplots of features against `PRICE`, split into two groups for readability.
### 2. Data Preparation
* **Train-Test Split**: The data is split 80/20 into training and testing sets using `sklearn.model_selection.train_test_split` (`random_state=0`), giving 404 training rows and 102 test rows.
* **No feature scaling is applied** — all models are run on raw feature values.
### 3. Feature Selection & Model Training
Six different approaches are used and compared:
1.  **Multiple Linear Regression with VIF-based elimination** (`statsmodels.api.OLS`) — features with Variance Inflation Factor above ~10 are removed one at a time until multicollinearity is resolved.
2.  **Linear Regression** (`sklearn.linear_model.LinearRegression`) on the full 13-feature set.
3.  **Recursive Feature Elimination** (`sklearn.feature_selection.RFE`) to automatically select the top 7 features.
4.  **Principal Component Analysis** (`sklearn.decomposition.PCA`) to reduce to 5 components and check predictive power.
5.  **Lasso Regression** (`sklearn.linear_model.Lasso`, alpha=10.0) to let the model zero out weak coefficients automatically.
6.  **Random Forest** (`sklearn.ensemble.RandomForestRegressor`) as a non-linear cross-check on feature importance.
### 4. Model Performance
The models are evaluated using **R-squared ($R^2$)**, **Mean Absolute Error**, and **Root Mean Squared Error** on the test set.

| Approach | Test R² | Test RMSE |
|---|---|---|
| Linear Regression (13 features) | 0.589 | 5.78 |
| RFE (7 features) | 0.547 | 6.08 |
| VIF-reduced OLS (7 features) | 0.464 | 6.61 |
| Lasso (alpha=10) | 0.332 | 7.38 |
| PCA (5 components) | 0.059 | 8.75 |

* `RM` and `LSTAT` consistently emerged as the strongest predictors across methods (Random Forest importance: 0.393 and 0.430 respectively).
* Residuals for each model were plotted (KDE and scatter against actual values) to check for normal distribution, a key assumption of linear regression.
* **Note:** the best result here (R² ≈ 0.59) is moderate, not high — this project's value is in comparing feature selection strategies and diagnosing multicollinearity, not in producing a high-accuracy production model. A single train-test split was used rather than cross-validation, so these numbers are indicative rather than precise.

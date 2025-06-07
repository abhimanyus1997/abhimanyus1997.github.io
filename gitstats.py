import os
import requests
import time
from collections import defaultdict
from dotenv import load_dotenv
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from datetime import datetime, timedelta
from tqdm import tqdm
import markdown

load_dotenv()

# Configuration
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
USERNAME = "abhimanyus1997"
BASE_URL = "https://api.github.com"
HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}
OUTPUT_DIR = "output"
CSV_DIR = os.path.join(OUTPUT_DIR, "csv")
CHARTS_DIR = os.path.join(OUTPUT_DIR, "charts")

# Ensure output directories exist
os.makedirs(CSV_DIR, exist_ok=True)
os.makedirs(CHARTS_DIR, exist_ok=True)

def check_rate_limit(response):
    """Check API rate limit and wait if necessary."""
    remaining = int(response.headers.get("X-RateLimit-Remaining", 0))
    reset_time = int(response.headers.get("X-RateLimit-Reset", 0))
    if remaining < 10:
        wait_time = reset_time - int(time.time()) + 5
        print(f"Rate limit low ({remaining} requests remaining). Waiting {wait_time} seconds...")
        time.sleep(wait_time)

def get_repositories(username):
    """Fetch all repositories for the given username."""
    repos = []
    page = 1
    while True:
        url = f"{BASE_URL}/users/{username}/repos?per_page=100&page={page}"
        response = requests.get(url, headers=HEADERS)
        check_rate_limit(response)
        response.raise_for_status()
        data = response.json()
        if not data:
            break
        repos.extend(data)
        page += 1
    return repos

def get_languages(repo_owner, repo_name):
    """Fetch programming languages for a repository."""
    url = f"{BASE_URL}/repos/{repo_owner}/{repo_name}/languages"
    response = requests.get(url, headers=HEADERS)
    check_rate_limit(response)
    response.raise_for_status()
    return response.json()

def get_contributors_stats(repo_owner, repo_name):
    """Fetch contributor statistics with retry for cached data."""
    url = f"{BASE_URL}/repos/{repo_owner}/{repo_name}/stats/contributors"
    for _ in range(3):
        response = requests.get(url, headers=HEADERS)
        check_rate_limit(response)
        if response.status_code == 202:
            print(f"Stats for {repo_name} not ready. Waiting 5 seconds...")
            time.sleep(5)
            continue
        response.raise_for_status()
        return response.json()
    return []

def get_commit_activity(repo_owner, repo_name):
    """Fetch weekly commit activity for the last 52 weeks."""
    url = f"{BASE_URL}/repos/{repo_owner}/{repo_name}/stats/commit_activity"
    response = requests.get(url, headers=HEADERS)
    check_rate_limit(response)
    if response.status_code == 202:
        return []
    response.raise_for_status()
    return response.json()

def get_code_frequency(repo_owner, repo_name):
    """Fetch weekly additions and deletions."""
    url = f"{BASE_URL}/repos/{repo_owner}/{repo_name}/stats/code_frequency"
    response = requests.get(url, headers=HEADERS)
    check_rate_limit(response)
    if response.status_code == 202:
        return []
    response.raise_for_status()
    return response.json()

def get_participation(repo_owner, repo_name):
    """Fetch participation stats (owner vs. all commits)."""
    url = f"{BASE_URL}/repos/{repo_owner}/{repo_name}/stats/participation"
    response = requests.get(url, headers=HEADERS)
    check_rate_limit(response)
    if response.status_code == 202:
        return {}
    response.raise_for_status()
    return response.json()

def get_issues(repo_owner, repo_name):
    """Fetch open and closed issues."""
    url = f"{BASE_URL}/repos/{repo_owner}/{repo_name}/issues?state=all&per_page=100"
    response = requests.get(url, headers=HEADERS)
    check_rate_limit(response)
    response.raise_for_status()
    return response.json()

def get_pull_requests(repo_owner, repo_name):
    """Fetch pull requests (open and closed)."""
    url = f"{BASE_URL}/repos/{repo_owner}/{repo_name}/pulls?state=all&per_page=100"
    response = requests.get(url, headers=HEADERS)
    check_rate_limit(response)
    response.raise_for_status()
    return response.json()

def get_community_profile(repo_owner, repo_name):
    """Fetch community profile metrics."""
    url = f"{BASE_URL}/repos/{repo_owner}/{repo_name}/community/profile"
    response = requests.get(url, headers=HEADERS)
    check_rate_limit(response)
    response.raise_for_status()
    return response.json()

def save_to_csv(data, filename):
    """Save data to CSV file."""
    df = pd.DataFrame(data)
    df.to_csv(os.path.join(CSV_DIR, filename), index=False)

def plot_language_distribution(language_totals):
    """Plot pie chart for language distribution."""
    plt.figure(figsize=(10, 8))
    labels = language_totals.keys()
    sizes = language_totals.values()
    plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=140, colors=sns.color_palette("viridis", len(labels)))
    plt.title("Language Distribution Across Repositories")
    plt.savefig(os.path.join(CHARTS_DIR, "language_distribution.png"))
    plt.close()

def plot_repo_metrics(repos_stats):
    """Plot bar chart for repository metrics (stars, forks, watchers)."""
    repo_names = list(repos_stats.keys())
    stars = [stats["metadata"]["stars"] for stats in repos_stats.values()]
    forks = [stats["metadata"]["forks"] for stats in repos_stats.values()]
    watchers = [stats["metadata"]["watchers"] for stats in repos_stats.values()]

    df = pd.DataFrame({
        "Repository": repo_names * 3,
        "Count": stars + forks + watchers,
        "Metric": ["Stars"] * len(repo_names) + ["Forks"] * len(repo_names) + ["Watchers"] * len(repo_names)
    })

    plt.figure(figsize=(12, 6))
    sns.barplot(x="Repository", y="Count", hue="Metric", data=df, palette="viridis")
    plt.title("Repository Metrics (Stars, Forks, Watchers)")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, "repo_metrics.png"))
    plt.close()

def plot_commit_activity(repos_stats):
    """Plot line chart for commit activity over time."""
    plt.figure(figsize=(14, 6))
    for repo_name, stats in repos_stats.items():
        if stats["commit_activity"]:
            weeks = [datetime.fromtimestamp(week["week"]) for week in stats["commit_activity"]]
            commits = [week["total"] for week in stats["commit_activity"]]
            plt.plot(weeks, commits, label=repo_name)
    plt.title("Weekly Commit Activity (Last 52 Weeks)")
    plt.xlabel("Week")
    plt.ylabel("Commits")
    plt.legend(bbox_to_anchor=(1.05, 1), loc="upper left")
    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, "commit_activity.png"))
    plt.close()

def plot_contributor_commits(repos_stats):
    """Plot bar chart for contributor commits."""
    contributors = []
    commits = []
    repos = []
    for repo_name, stats in repos_stats.items():
        for contributor in stats["contributors"]:
            contributors.append(contributor["author"]["login"])
            commits.append(sum(week["c"] for week in contributor["weeks"]))
            repos.append(repo_name)

    df = pd.DataFrame({"Contributor": contributors, "Commits": commits, "Repository": repos})
    plt.figure(figsize=(12, 6))
    sns.barplot(x="Contributor", y="Commits", hue="Repository", data=df, palette="viridis")
    plt.title("Commits by Contributor Across Repositories")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, "contributor_commits.png"))
    plt.close()

def plot_issues_prs(repos_stats):
    """Plot stacked bar chart for issues and pull requests."""
    repo_names = list(repos_stats.keys())
    issues_open = [sum(1 for issue in stats["issues"] if issue["state"] == "open") for stats in repos_stats.values()]
    issues_closed = [sum(1 for issue in stats["issues"] if issue["state"] == "closed") for stats in repos_stats.values()]
    prs_open = [sum(1 for pr in stats["pull_requests"] if pr["state"] == "open") for stats in repos_stats.values()]
    prs_closed = [sum(1 for pr in stats["pull_requests"] if pr["state"] == "closed") for stats in repos_stats.values()]

    df = pd.DataFrame({
        "Repository": repo_names * 4,
        "Count": issues_open + issues_closed + prs_open + prs_closed,
        "Type": ["Issues Open"] * len(repo_names) + ["Issues Closed"] * len(repo_names) +
                ["PRs Open"] * len(repo_names) + ["PRs Closed"] * len(repo_names)
    })

    plt.figure(figsize=(12, 6))
    sns.barplot(x="Repository", y="Count", hue="Type", data=df, palette="viridis")
    plt.title("Issues and Pull Requests (Open vs. Closed)")
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    plt.savefig(os.path.join(CHARTS_DIR, "issues_prs.png"))
    plt.close()

def generate_report(repos_stats, language_totals):
    """Generate a detailed Markdown report."""
    report = [
        "# GitHub Repository Statistics Report",
        f"**Generated on**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Username**: {USERNAME}",
        f"**Total Repositories**: {len(repos_stats)}",
        "\n## Language Breakdown",
        "The following chart shows the distribution of programming languages across all repositories:",
        "![Language Distribution](charts/language_distribution.png)",
        "\n### Language Details",
        "| Language | Bytes of Code |",
        "|----------|---------------|"
    ]
    for lang, bytes_of_code in sorted(language_totals.items(), key=lambda x: x[1], reverse=True):
        report.append(f"| {lang} | {bytes_of_code} |")

    if "Python" in language_totals:
        report.append(f"\n**Python Usage**: {language_totals['Python']} bytes of Python code detected, indicating significant use in projects like Resume JD Matcher, cryptoTracker, and Langchain One.")
    else:
        report.append("\n**Python Usage**: No Python code detected.")

    report.extend([
        "\n## Repository Metrics",
        "The following chart compares stars, forks, and watchers across repositories:",
        "![Repository Metrics](charts/repo_metrics.png)",
        "\n## Commit Activity",
        "Weekly commit activity over the last 52 weeks:",
        "![Commit Activity](charts/commit_activity.png)",
        "\n## Contributor Activity",
        "Commits by contributors across repositories:",
        "![Contributor Commits](charts/contributor_commits.png)",
        "\n## Issues and Pull Requests",
        "Status of issues and pull requests:",
        "![Issues and PRs](charts/issues_prs.png)",
        "\n## Detailed Repository Statistics"
    ])

    for repo_name, stats in repos_stats.items():
        report.extend([
            f"\n### {repo_name}",
            f"- **Stars**: {stats['metadata']['stars']}",
            f"- **Forks**: {stats['metadata']['forks']}",
            f"- **Watchers**: {stats['metadata']['watchers']}",
            f"- **Open Issues**: {stats['metadata']['open_issues']}",
            f"- **Size**: {stats['metadata']['size']} KB",
            f"- **Created**: {stats['metadata']['created_at']}",
            f"- **Languages**: {', '.join(f'{k}: {v} bytes' for k, v in stats['languages'].items())}",
            f"- **Contributors**: {len(stats['contributors'])}",
            f"- **Total Commits (Last 52 Weeks)**: {sum(week['total'] for week in stats['commit_activity'])}",
            f"- **Issues**: {len(stats['issues'])} (Open: {sum(1 for issue in stats['issues'] if issue['state'] == 'open')})",
            f"- **Pull Requests**: {len(stats['pull_requests'])} (Open: {sum(1 for pr in stats['pull_requests'] if pr['state'] == 'open')})",
            f"- **Community Health**: {stats['community_profile'].get('health_percentage', 0)}%"
        ])

    report.extend([
        "\n## Analysis and Insights",
        "- **Python Dominance**: Python is a key language, aligning with your portfolio's focus on AI and data science projects.",
        "- **Activity Trends**: Commit activity peaks may correlate with project deadlines or releases.",
        "- **Community Engagement**: Repositories with higher stars and forks indicate strong community interest.",
        "- **Maintenance**: Low open issues suggest well-maintained projects.",
        "\n**Data Files**: All statistics are saved in `csv/` directory.",
        "\n**Charts**: Visualizations are saved in `charts/` directory."
    ])

    with open(os.path.join(OUTPUT_DIR, "report.md"), "w") as f:
        f.write("\n".join(report))

def main():
    if not GITHUB_TOKEN:
        print("Please set the GITHUB_TOKEN environment variable.")
        return

    try:
        # Initialize data structures
        repos_stats = {}
        language_totals = defaultdict(int)
        repo_data = []
        language_data = []
        contributor_data = []
        commit_activity_data = []
        code_frequency_data = []
        issue_data = []
        pr_data = []
        community_data = []

        # Fetch repositories
        print(f"Fetching repositories for {USERNAME}...")
        repos = get_repositories(USERNAME)
        if not repos:
            print("No repositories found or access denied.")
            return

        for repo in tqdm(repos, desc="Processing repositories"):
            repo_name = repo["name"]
            repo_owner = repo["owner"]["login"]

            repos_stats[repo_name] = {
                "metadata": {
                    "stars": repo["stargazers_count"],
                    "forks": repo["forks_count"],
                    "watchers": repo["watchers_count"],
                    "open_issues": repo["open_issues_count"],
                    "created_at": repo["created_at"],
                    "size": repo["size"],
                    "default_branch": repo["default_branch"]
                },
                "languages": {},
                "contributors": [],
                "commit_activity": [],
                "code_frequency": [],
                "participation": {},
                "issues": [],
                "pull_requests": [],
                "community_profile": {}
            }

            # Fetch and store data
            repos_stats[repo_name]["languages"] = get_languages(repo_owner, repo_name)
            for lang, bytes_of_code in repos_stats[repo_name]["languages"].items():
                language_totals[lang] += bytes_of_code
                language_data.append({"Repository": repo_name, "Language": lang, "Bytes": bytes_of_code})

            repos_stats[repo_name]["contributors"] = get_contributors_stats(repo_owner, repo_name)
            for contributor in repos_stats[repo_name]["contributors"]:
                contributor_data.append({
                    "Repository": repo_name,
                    "Contributor": contributor["author"]["login"],
                    "Commits": sum(week["c"] for week in contributor["weeks"]),
                    "Additions": sum(week["a"] for week in contributor["weeks"]),
                    "Deletions": sum(week["d"] for week in contributor["weeks"])
                })

            repos_stats[repo_name]["commit_activity"] = get_commit_activity(repo_owner, repo_name)
            for week in repos_stats[repo_name]["commit_activity"]:
                commit_activity_data.append({
                    "Repository": repo_name,
                    "Week": datetime.fromtimestamp(week["week"]).strftime("%Y-%m-%d"),
                    "Commits": week["total"]
                })

            repos_stats[repo_name]["code_frequency"] = get_code_frequency(repo_owner, repo_name)
            for week in repos_stats[repo_name]["code_frequency"]:
                code_frequency_data.append({
                    "Repository": repo_name,
                    "Week": datetime.fromtimestamp(week[0]).strftime("%Y-%m-%d"),
                    "Additions": week[1],
                    "Deletions": week[2]
                })

            repos_stats[repo_name]["participation"] = get_participation(repo_owner, repo_name)
            repos_stats[repo_name]["issues"] = get_issues(repo_owner, repo_name)
            for issue in repos_stats[repo_name]["issues"]:
                issue_data.append({
                    "Repository": repo_name,
                    "Issue_ID": issue["id"],
                    "Title": issue["title"],
                    "State": issue["state"],
                    "Created_At": issue["created_at"]
                })

            repos_stats[repo_name]["pull_requests"] = get_pull_requests(repo_owner, repo_name)
            for pr in repos_stats[repo_name]["pull_requests"]:
                pr_data.append({
                    "Repository": repo_name,
                    "PR_ID": pr["id"],
                    "Title": pr["title"],
                    "State": pr["state"],
                    "Created_At": pr["created_at"]
                })

            repos_stats[repo_name]["community_profile"] = get_community_profile(repo_owner, repo_name)
            community_data.append({
                "Repository": repo_name,
                "Health_Percentage": repos_stats[repo_name]["community_profile"].get("health_percentage", 0),
                "Has_README": "README" in repos_stats[repo_name]["community_profile"].get("files", {}),
                "Has_LICENSE": "license" in repos_stats[repo_name]["community_profile"].get("files", {})
            })

            repo_data.append({
                "Repository": repo_name,
                **repos_stats[repo_name]["metadata"],
                "Contributors": len(repos_stats[repo_name]["contributors"]),
                "Total_Commits": sum(week["total"] for week in repos_stats[repo_name]["commit_activity"]),
                "Issues": len(repos_stats[repo_name]["issues"]),
                "Issues_Open": sum(1 for issue in repos_stats[repo_name]["issues"] if issue["state"] == "open"),
                "Pull_Requests": len(repos_stats[repo_name]["pull_requests"]),
                "PRs_Open": sum(1 for pr in repos_stats[repo_name]["pull_requests"] if pr["state"] == "open"),
                "Community_Health": repos_stats[repo_name]["community_profile"].get("health_percentage", 0)
            })

        # Save CSVs
        save_to_csv(repo_data, "repositories.csv")
        save_to_csv(language_data, "languages.csv")
        save_to_csv(contributor_data, "contributors.csv")
        save_to_csv(commit_activity_data, "commit_activity.csv")
        save_to_csv(code_frequency_data, "code_frequency.csv")
        save_to_csv(issue_data, "issues.csv")
        save_to_csv(pr_data, "pull_requests.csv")
        save_to_csv(community_data, "community_profile.csv")

        # Generate charts
        sns.set_style("darkgrid")
        plot_language_distribution(language_totals)
        plot_repo_metrics(repos_stats)
        plot_commit_activity(repos_stats)
        plot_contributor_commits(repos_stats)
        plot_issues_prs(repos_stats)

        # Generate report
        generate_report(repos_stats, language_totals)
        print(f"\nStatistics saved in '{OUTPUT_DIR}/csv/'")
        print(f"Charts saved in '{OUTPUT_DIR}/charts/'")
        print(f"Report saved as '{OUTPUT_DIR}/report.md'")

    except requests.exceptions.RequestException as e:
        print(f"Error accessing GitHub API: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()

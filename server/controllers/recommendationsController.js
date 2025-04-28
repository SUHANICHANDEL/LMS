import { PythonShell } from 'python-shell';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        let options = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: path.join(__dirname, '../recommendations'),
            args: [userId]
        };

        PythonShell.run('recommendation_model.py', options, function (err, results) {
            if (err) {
                console.error("Python Shell Error:", err);
                return res.status(500).json({ message: "Error generating recommendations" });
            }

            let recommendations = JSON.parse(results[0].replace(/'/g, '"'));
            return res.status(200).json({ recommendedCourses: recommendations });
        });

    } catch (error) {
        console.error("Error in getRecommendations:", error);
        res.status(500).json({ message: "Server error" });
    }
};

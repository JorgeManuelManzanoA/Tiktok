from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# Configuración de la conexión a MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['Examen3']
watch_times_collection = db['tiktok']

# Ruta para recibir los datos de tiempo de visualización
@app.route('/api/video-watch-time', methods=['POST'])
def receive_watch_time():
    data = request.json
    video_id = data['video_id']
    watch_time = data['watch_time']
    print(f"Video ID: {video_id}, Watch Time: {watch_time} seconds")
    watch_times_collection.insert_one({'video_id': video_id, 'watch_time': watch_time})
    return jsonify({'message': 'Watch time received'}), 200

# Ruta para obtener todos los tiempos de visualización almacenados
@app.route('/api/watch-times', methods=['GET'])
def get_watch_times():
    watch_times = list(watch_times_collection.find({}, {'_id': 0}))
    return jsonify(watch_times), 200

if __name__ == '__main__':
    app.run(debug=True)


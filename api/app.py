from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from google.cloud import storage
from flask_redis import FlaskRedis
import os

app = Flask(__name__)
CORS(app)

# Configuración de la conexión a MongoDB
client = MongoClient('mongodb://34.23.237.38:27017/')
db = client['Examen3']
watch_times_collection = db['tiktok']
videos_collection = db['videos']

# Configuración de Redis
app.config['REDIS_URL'] = "redis://34.23.237.38:6379/0"
redis_client = FlaskRedis(app)

# Configuración de Google Cloud Storage
# Asegúrate de que la variable de entorno GOOGLE_APPLICATION_CREDENTIALS esté configurada
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = './credenciales.json'  # Reemplaza con la ruta a tus credenciales

storage_client = storage.Client()
bucket_name = 'videos-tiktok'  # Reemplaza con tu bucket de Google Cloud Storage
bucket = storage_client.bucket(bucket_name)

# Ruta para subir videos a Google Cloud Storage y guardar la URL en MongoDB
@app.route('/api/upload-video', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    # Guardar el archivo en Google Cloud Storage
    blob = bucket.blob(file.filename)
    blob.upload_from_file(file)
    
    # Guardar la ruta en MongoDB
    video_document = {
        'filename': file.filename,
        'url': blob.public_url
    }
    videos_collection.insert_one(video_document)
    
    return jsonify({"message": "File uploaded successfully", "url": blob.public_url}), 201

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

# Ruta para obtener todas las URL de los videos almacenados
@app.route('/api/videos', methods=['GET'])
def get_videos():
    cached_videos = redis_client.get('videos')
    if cached_videos:
        return jsonify({"videos": eval(cached_videos.decode('utf-8'))})  # Uso de eval para convertir la cadena a lista

    videos = list(videos_collection.find({}, {'_id': 0, 'filename': 1, 'url': 1}))
    redis_client.set('videos', str(videos))
    return jsonify({"videos": videos})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

app = Flask(__name__)
CORS(app)

# --- Conexión a MongoDB ---
client = None
db = None
collection = None
try:
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    db = client['generador_horarios']
    collection = db['profesores']
    print("Conexión a MongoDB exitosa.")
except ConnectionFailure:
    print("❌ Error de conexión a MongoDB. Asegúrate de que esté corriendo.")

# --- Rutas de la API ---
@app.route('/api/profesores', methods=['POST'])
def crear_profesor():
    # --- SOLUCIÓN AL ERROR `NotImplementedError` ---
    # Se cambia 'if not collection:' por 'if collection is None:'
    if collection is None:
        return jsonify({"error": "No hay conexión con la base de datos"}), 500
        
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se recibieron datos"}), 400

    nue = data.get('nue')
    if not nue:
        return jsonify({"error": "El campo NUE es obligatorio"}), 400

    try:
        # Guardar o actualizar en MongoDB
        collection.update_one({'nue': nue}, {'$set': data}, upsert=True)
    except Exception as e:
        print(f"Error al escribir en MongoDB: {e}")
        return jsonify({"error": "No se pudo escribir en la base de datos.", "details": str(e)}), 500


    # --- Lógica para escribir en archivos CSV ---
    try:
        # Crear directorios si no existen
        os.makedirs('data/profesor', exist_ok=True)

        # 1. CSV Individual del profesor
        df_profesor = pd.json_normalize(data)
        df_profesor.to_csv(f'data/profesor/{nue}.csv', index=False)

        # --- Tablas Generales ---
        nombre_completo = f"{data.get('nombres', '')} {data.get('apellidos', '')}".strip()

        # 2. Tabla NUE - Maestro - Nombramiento
        maestros_df = pd.DataFrame({
            'NUE': [nue], 'Maestro': [nombre_completo], 'Nombramiento': [data.get('nombramiento')]
        })

        # 3. Tabla Materias de Interés
        materias_df = pd.DataFrame([
            {'NUE': nue, 'Maestro': nombre_completo, 'Materia_Interes': materia}
            for materia in data.get('udasInteres', [])
        ])

        # 4. Tabla Disponibilidad
        disponibilidad_lista = []
        disponibilidad = data.get('disponibilidad', {})

        if isinstance(disponibilidad, dict):
            for dia, horas_bool in disponibilidad.items():
                i = 0
                while i < len(horas_bool):
                    if horas_bool[i]:
                        hora_inicio = i + 8
                        j = i
                        while j < len(horas_bool) and horas_bool[j]: j += 1
                        hora_fin = j + 8
                        disponibilidad_lista.append({
                            'NUE': nue, 'Maestro': nombre_completo, 'Dia': dia,
                            'Hora_Inicio': f"{hora_inicio}:00", 'Hora_Fin': f"{hora_fin}:00"
                        })
                        i = j
                    else:
                        i += 1
        
        disponibilidad_df = pd.DataFrame(disponibilidad_lista)

        def actualizar_csv(filepath, df_nuevo, key_column):
            df_final = df_nuevo
            if os.path.exists(filepath):
                try:
                    df_existente = pd.read_csv(filepath)
                    if not df_existente.empty:
                        df_existente = df_existente[df_existente[key_column].astype(str) != str(nue)]
                        df_final = pd.concat([df_existente, df_nuevo], ignore_index=True)
                except pd.errors.EmptyDataError:
                    pass # El archivo existe pero está vacío, se sobreescribe
            df_final.to_csv(filepath, index=False)

        actualizar_csv('data/maestros.csv', maestros_df, 'NUE')
        if not materias_df.empty:
            actualizar_csv('data/materias_interes.csv', materias_df, 'NUE')
        if not disponibilidad_df.empty:
            actualizar_csv('data/disponibilidad.csv', disponibilidad_df, 'NUE')

    except Exception as e:
        print(f"Error al guardar los archivos CSV: {e}")
        return jsonify({"message": "Datos guardados en DB, pero hubo un error al crear los CSVs.", "error": str(e)}), 500

    return jsonify({"message": "Profesor registrado y archivos CSV actualizados con éxito"}), 201


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

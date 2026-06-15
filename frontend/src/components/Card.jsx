function Card({ title, description, image, action }) {
  return (
    <div className="border rounded-lg shadow-md p-4 w-72">
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-cover rounded"
      />

      <h2 className="text-xl font-bold mt-3">
        {title}
      </h2>

      <p className="text-gray-600 mt-2">
        {description}
      </p>

      {action && (
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          {action}
        </button>
      )}
    </div>
  );
}

export default Card;
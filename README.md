# HeyNowBOTWhatsApp
**La idea de este bot es brindarle a un servicio de consulta, la chance de que los clientes puedan agendar una consulta, de una manera muy fácil y rápida, así mismo como lograr que al dependiente de la consultora, se le facilite acceder a las agendas, podes administrarlas y visualizarlas. En este caso, el ejemplo es con un servicio de odontología**

*El bot funciona a través del canal WhatsApp, posee un funcionamientos muy sencillo y amigable, para cualquiera de las dos partes, ya seas cliente o administrador*

*Primero veamos como funciona el camino del usuario/cliente.*

*El objetivo como cliente, debería ser agendar una consulta, para esto deberá iniciar una conversación con el bot como lo realizarias con cualquier persona, o indicandole cual es tu objetivo, en este caso, realizar una agenda. A partir de ese mensaje con el que inicies la conversación, el bot te dirá lo pasos a seguir para la acción que decidas realizar, podrás agendarte, revisar tu agenda, o si te salió un imprevisto y deseas cancelarla, también podrás hacerlo.*

*Como administrador, es parecido, tendrás una forma de identificarte como el mismo hacia el bot (ya veremos como más adelante), y a partir de ahí, el bot te indicará lo pasos a seguir, dependiendo de la acción que desees realizar, ya sea revisar la agenda que tienes para hoy, o como borrar una en particular porque el cliente ya se presentó.*

**El bot funciona casi en su totalidad con los mensajes que recibe, a partir de ellos sabrá que hacer, y como responderte. Los datos que obtiene, los usará para guardarlos en una base de datos, para así poder tener información que el cliente o el administrador, pueda llegar a requerir en un futuro**

**Para el desarrollo, utilicé Node.js, Prisma como ORM, y MongoDB como base de datos. También hice uso de dotenv para las variables de entorno, y por supuesto la librería de WhatsApp Web JS, para poder lograr el uso de whatsapp como interfaz de interacción**

---

## Como usar el bot

**Primero que nada tendrás que clonar el repositorio en tu local**

**Una vez ya tengas la carpeta en tu computadora, tendrás que abrirla en un editor de texto, idealmente Visual Studio Code.**

**Ahora, instale las dependencias, abra la terminal y ejecute el siguiente comando `npm install`**

**Para que el bot funcione correctamente, necesitás una base de datos en MongoDB, la cual debe agregarse con este nombre de variable: DATABASE_URL, en un archivo .env que debes crear en la carpeta principal. Luego de agregar tu base de datos, en la consola escriba los siguientes comandos, en el mismo orden: `npx prisma db push`, `npx prisma generate`, esto hará que se creen los modelos en tu base de datos, y que el cliente de prisma, se adhiera a los mismos.**

**Como tambien tenemos la funcionalidad de admin, debemos agregar dos variables de entorno más, una debe llamarse ADMIN_KEY que es la palabra clave con la que te identificarás como administrador, y la otra variable debe ser ADMIN_NUMBER que también es para identificarte como administrador, en esta última debes darle como valor, el número de telefono que le corresponda al administrador, por ejemplo si sos de Uruguay (+598) 99 333 333 este sería un número de celular uruguayo, esos datos debes asignarselos a la variable de la siguiente forma: 59899333333, solo los números, sin parentésis ni signos. Esto es para que el bot, solo realice las acciones de administrador, si el mensaje proviene de ese número. Para iniciar una conversación con el bot, identificandote como admin, debes ingresar como primer mensaje, el valor asignado a la variable ADMIN_KEY, a partir de ahí es simplemente seguir los pasos, pero si los mensajes son enviados desde otro celular que no sea el que pusiste en ADMIN_NUMBER, el bot no te responderá a las acciones de admin.**

**Ahora solo queda hacerlo funcionar, para eso, en la consola, escriba el siguiente comando `npm run dev`, esto inicializará el bot, la primera vez se te generará un código QR en consola, que deberás escanear desde tu app de whatsapp en el celular que quieras asociar el bot. Y listo, a partir de ahora, cada mensaje que te escriban a ese celular (mientras tengas la aplicación corriendo), si el bot detecta que puede llegar a ser un mensaje con interés de agendarse o de uso administrativo, responderá automaticamente con los pasos a seguir**